import getBandStream from "./readFromStream";
import { rxToStream } from "rxjs-stream";
import path from "path";
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
import { sha1 } from "object-hash";

import countryBlackList from "./countryBlackList.json";
import { none, Option, some } from "fp-ts/lib/Option";
import { absurd } from "fp-ts/lib/function";
import { Overview } from "./types/Overview";

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

const toOverview = (
  acc: Overview,
  input: BandInProcessingStep<WithGenreList>
): Overview => {
  switch (input._tag) {
    case "Left":
      switch (input.left.reason) {
        case "Country could not be parsed":
          acc.filteredOut["Country could not be parsed"].push(
            input.left.maEntry
          );
          break;
        case "Country is too small":
          acc.filteredOut["Country is too small"].push(input.left.maEntry);
          break;
        case "No releases found":
          acc.filteredOut["No releases found"].push(input.left.maEntry);
          break;
        case "Not a metal band":
          acc.filteredOut["Not a metal band"].push(input.left.maEntry);
          break;
        case "Not in a relevant genre":
          acc.filteredOut["Not in a relevant genre"].push(input.left.maEntry);
          break;
        default:
          absurd(input.left.reason);
          break;
      }
      break;
    case "Right":
      acc.includedBands.push({
        sha1: sha1(input.right.maEntry),
        firstRelease: input.right.firstRelease,
        latestRelease: input.right.latestRelease,
        genres: input.right.genres,
        countryCode: input.right.countryCode
      });
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
    rReduce<Either<FilteredOutEntry, WithGenreList>, Overview>(toOverview, {
      filteredOut: {
        "Country could not be parsed": [],
        "No releases found": [],
        "Country is too small": [],
        "Not a metal band": [],
        "Not in a relevant genre": []
      },
      includedBands: []
    })
  )
  .pipe(rMap(toString));

rxToStream(obs).pipe(process.stdout);
