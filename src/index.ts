import getBandStream from "./readFromStream";
import { rxToStream } from "rxjs-stream";
import path from "path";
import * as R from "ramda";
import { map as rMap, reduce as rReduce } from "rxjs/operators";
import {
  BandInProcessingStep,
  CountryCode,
  FilteredOutEntry,
  Genres,
  MetalArchivesEntry,
  WithCountryCode,
  WithCountryCodes,
  WithGenreList,
  WithParsedYears,
  WithValidatedCountryCode
} from "./types/Band";
import countryMapper from "country-mapper";
import { getCode } from "country-list";
import {
  chain,
  Either,
  getOrElse,
  left,
  map as eMap,
  right
} from "fp-ts/lib/Either";
import {
  isBlackMetal,
  isDeathMetal,
  isDoomMetal,
  isHeavyMetal,
  isMetal,
  isPowerMetal,
  isSpeedMetal,
  isThrashMetal
} from "ordo-ab-chao";

import countryBlackList from "./countryBlackList.json";
import { none, Option, some } from "fp-ts/lib/Option";
import { identity } from "fp-ts/lib/function";
import { absurd } from "fp-ts/lib/function";
import {
  Overview,
  ReducedBands,
  ReducedBandsWithRejectionsCounts
} from "./types/Overview";

const metalArchivesExport: "band_20190607.csv" = "band_20190607.csv";

const classifiers: ((genre: string) => Option<Genres>)[] = [
  (genre: string): Option<Genres> =>
    isBlackMetal.runWith(genre) ? some("Black Metal") : none,
  (genre: string): Option<Genres> =>
    isDeathMetal.runWith(genre) ? some("Death Metal") : none,
  (genre: string): Option<Genres> =>
    isDoomMetal.runWith(genre) ? some("Doom Metal") : none,
  (genre: string): Option<Genres> =>
    isHeavyMetal.runWith(genre) ? some("Heavy Metal") : none,
  (genre: string): Option<Genres> =>
    isPowerMetal.runWith(genre) ? some("Power Metal") : none,
  (genre: string): Option<Genres> =>
    isSpeedMetal.runWith(genre) ? some("Speed Metal") : none,
  (genre: string): Option<Genres> =>
    isThrashMetal.runWith(genre) ? some("Thrash Metal") : none
];

const locationOfMetalArchivesExport = path.join(
  __dirname,
  "..",
  "..",
  metalArchivesExport
);

const toString = (overview: Overview): string =>
  JSON.stringify(overview, null, 4);

const sortAndCount = (rejectedValues: string[]): Record<string, number> => {
  const counted = R.countBy<string>(identity)(rejectedValues);
  const pairs = R.toPairs<number>(counted);
  const sorted = R.sortBy((a: [string, number]) => a[1], pairs);
  const reversed = R.reverse<[string, number]>(sorted);
  return R.fromPairs<number>(reversed);
};

const countRejections = (
  reducedBands: ReducedBands
): ReducedBandsWithRejectionsCounts => {
  return {
    filteredOut: {
      total: reducedBands.filteredOut.total,
      reasons: {
        "Country could not be parsed": sortAndCount(
          reducedBands.filteredOut.reasons["Country could not be parsed"]
        ),
        "Country is too small": sortAndCount(
          reducedBands.filteredOut.reasons["Country is too small"]
        ),
        "No releases found": sortAndCount(
          reducedBands.filteredOut.reasons["No releases found"]
        ),
        "Not a metal band": sortAndCount(
          reducedBands.filteredOut.reasons["Not a metal band"]
        ),
        "Not in a relevant genre": sortAndCount(
          reducedBands.filteredOut.reasons["Not in a relevant genre"]
        )
      }
    },
    includedBands: reducedBands.includedBands
  };
};

const toReducedBands = (
  acc: ReducedBands,
  input: BandInProcessingStep<WithGenreList>
): ReducedBands => {
  switch (input._tag) {
    case "Left":
      acc.filteredOut.total = acc.filteredOut.total + 1;
      switch (input.left.reason) {
        case "Country could not be parsed":
          acc.filteredOut.reasons["Country could not be parsed"].push(
            input.left.maEntry.Country
          );
          break;
        case "Country is too small":
          acc.filteredOut.reasons["Country is too small"].push(
            input.left.maEntry.Country
          );
          break;
        case "No releases found":
          acc.filteredOut.reasons["No releases found"].push(
            `first release: ${input.left.maEntry["First release"]}, latest release: ${input.left.maEntry["Latest release"]}`
          );
          break;
        case "Not a metal band":
          acc.filteredOut.reasons["Not a metal band"].push(
            input.left.maEntry.Genre
          );
          break;
        case "Not in a relevant genre":
          acc.filteredOut.reasons["Not in a relevant genre"].push(
            input.left.maEntry.Genre
          );
          break;
        default:
          absurd(input.left.reason);
          break;
      }
      break;
    case "Right":
      acc.includedBands.push(input.right);
      break;
    default:
      absurd(input);
      break;
  }
  return acc;
};

const parseReleaseDates = (input: MetalArchivesEntry): WithParsedYears => ({
  maEntry: input,
  firstRelease: parseInt(input["First release"], 10),
  latestRelease: parseInt(input["Latest release"], 10)
});

const hasReleases = (
  input: WithParsedYears
): BandInProcessingStep<WithParsedYears> =>
  Number.isNaN(input.firstRelease) && Number.isNaN(input.latestRelease)
    ? left({
        reason: "No releases found",
        maEntry: input.maEntry
      })
    : right(input);

const customCountryMapping: Record<string, string> = {
  "Korea, South": "KR",
  Svalbard: "NO"
};

const customCountryMapper = (country: string): string | undefined =>
  customCountryMapping[country];

const getCountryCodes = (
  input: BandInProcessingStep<WithParsedYears>
): BandInProcessingStep<WithCountryCodes> => {
  const mapper = eMap((entry: WithParsedYears) => {
    const codes: string[] = [
      countryMapper.convert(entry.maEntry.Country) || "",
      getCode(entry.maEntry.Country) || "",
      customCountryMapper(entry.maEntry.Country) || ""
    ].filter(code => code !== "");
    return {
      maEntry: entry.maEntry,
      firstRelease: entry.firstRelease,
      latestRelease: entry.latestRelease,
      countryCodes: new Set(codes)
    };
  });
  return mapper(input);
};

const getCountryCode = (
  input: BandInProcessingStep<WithCountryCodes>
): BandInProcessingStep<WithCountryCode> => {
  const mapper = eMap((entry: WithCountryCodes) => {
    const code: CountryCode =
      entry.countryCodes.size === 1
        ? right(entry.countryCodes.values().next().value)
        : left("Country could not be parsed");
    return {
      maEntry: entry.maEntry,
      firstRelease: entry.firstRelease,
      latestRelease: entry.latestRelease,
      countryCode: code
    };
  });
  return mapper(input);
};

const orEmptyString: (ma: CountryCode) => string = getOrElse(() => "");

const unpackCountryCode = (
  input: WithCountryCode
): BandInProcessingStep<WithValidatedCountryCode> => {
  switch (input.countryCode._tag) {
    case "Right":
      return right({
        maEntry: input.maEntry,
        latestRelease: input.latestRelease,
        firstRelease: input.firstRelease,
        countryCode: orEmptyString(input.countryCode)
      });
    case "Left":
      return left({
        maEntry: input.maEntry,
        reason: "Country could not be parsed"
      });
    default:
      return absurd(input.countryCode);
  }
};

const countryIsNotOnBlackList = (
  input: WithValidatedCountryCode
): BandInProcessingStep<WithValidatedCountryCode> =>
  countryBlackList.includes(input.countryCode)
    ? left<FilteredOutEntry>({
        reason: "Country is too small",
        maEntry: input.maEntry
      })
    : right(input);

const bandIsAMetalBand = (
  input: WithValidatedCountryCode
): BandInProcessingStep<WithValidatedCountryCode> =>
  isMetal.isMetal.runWith(input.maEntry.Genre)
    ? right(input)
    : left<FilteredOutEntry>({
        reason: "Not a metal band",
        maEntry: input.maEntry
      });

const getGenres = (input: WithValidatedCountryCode): WithGenreList => {
  const optGenres: Option<Genres>[] = classifiers.map(fn =>
    fn(input.maEntry.Genre)
  );
  const genres = optGenres.reduce((acc: Genres[], value: Option<Genres>) => {
    switch (value._tag) {
      case "None":
        break;
      case "Some":
        acc.push(value.value);
        break;
      default:
        absurd(value);
        break;
    }
    return acc;
  }, []);
  return {
    maEntry: input.maEntry,
    firstRelease: input.firstRelease,
    latestRelease: input.latestRelease,
    countryCode: input.countryCode,
    genres: genres
  };
};

const hasNoEmptyGenre = (
  input: WithGenreList
): BandInProcessingStep<WithGenreList> =>
  input.genres.length > 0
    ? right(input)
    : left<FilteredOutEntry>({
        reason: "Not in a relevant genre",
        maEntry: input.maEntry
      });

const obs = getBandStream(locationOfMetalArchivesExport)
  .pipe(rMap(parseReleaseDates))
  .pipe(rMap(hasReleases))
  .pipe(rMap(getCountryCodes))
  .pipe(rMap(getCountryCode))
  .pipe(rMap(chain(unpackCountryCode)))
  .pipe(rMap(chain(countryIsNotOnBlackList)))
  .pipe(rMap(chain(bandIsAMetalBand)))
  .pipe(rMap(eMap(getGenres)))
  .pipe(rMap(chain(hasNoEmptyGenre)))
  .pipe(
    rReduce<Either<FilteredOutEntry, WithGenreList>, ReducedBands>(
      toReducedBands,
      {
        filteredOut: {
          reasons: {
            "Country could not be parsed": [],
            "No releases found": [],
            "Country is too small": [],
            "Not a metal band": [],
            "Not in a relevant genre": []
          },
          total: 0
        },
        includedBands: []
      }
    )
  )
  .pipe(rMap(countRejections))
  .pipe(rMap(toString));

rxToStream(obs).pipe(process.stdout);
