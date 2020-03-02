import getBandStream from "./readFromStream";
import { rxToStream } from "rxjs-stream";
import path from "path";
import { filter, map } from "rxjs/operators";
import {
  CountryCode,
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
import { getOrElse, isRight, left, right } from "fp-ts/lib/Either";
import {
  isMetal,
  isBlackMetal,
  isDeathMetal,
  isDoomMetal,
  isHeavyMetal,
  isPowerMetal,
  isSpeedMetal,
  isThrashMetal
} from "ordo-ab-chao";
import countryBlackList from "./countryBlackList.json";
import { none, Option, some } from "fp-ts/lib/Option";
import { absurd } from "fp-ts/lib/function";

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

const toString = (input: WithGenreList): string =>
  JSON.stringify(
    {
      firstRelease: input.firstRelease,
      latestRelease: input.latestRelease,
      countryCode: input.countryCode,
      genres: input.genres,
      bandName: input.maEntry["Band name"]
    },
    null,
    4
  );

const parseReleaseDates = (input: MetalArchivesEntry): WithParsedYears => ({
  maEntry: input,
  firstRelease: parseInt(input["First release"], 10),
  latestRelease: parseInt(input["Latest release"], 10)
});

const hasReleases = (input: WithParsedYears): boolean =>
  !(Number.isNaN(input.firstRelease) && Number.isNaN(input.latestRelease));

const customCountryMapping: Record<string, string> = {
  "Korea, South": "KR",
  Svalbard: "NO"
};

const customCountryMapper = (country: string): string | undefined =>
  customCountryMapping[country];

const getCountryCodes = (input: WithParsedYears): WithCountryCodes => {
  const codes: string[] = [
    countryMapper.convert(input.maEntry.Country) || "",
    getCode(input.maEntry.Country) || "",
    customCountryMapper(input.maEntry.Country) || ""
  ].filter(code => !!code);
  return {
    maEntry: input.maEntry,
    firstRelease: input.firstRelease,
    latestRelease: input.latestRelease,
    countryCodes: new Set(codes)
  };
};

const getCountryCode = (input: WithCountryCodes): WithCountryCode => {
  const code: CountryCode =
    input.countryCodes.size == 1
      ? right(input.countryCodes.values().next().value)
      : left("Country could not be parsed");
  return {
    maEntry: input.maEntry,
    firstRelease: input.firstRelease,
    latestRelease: input.latestRelease,
    countryCode: code
  };
};

const countryCodeIsRight = (input: WithCountryCode): boolean =>
  isRight(input.countryCode);

const orEmptyString: (ma: CountryCode) => string = getOrElse(() => "");

const unpackCountryCode = (
  input: WithCountryCode
): WithValidatedCountryCode => ({
  maEntry: input.maEntry,
  latestRelease: input.latestRelease,
  firstRelease: input.firstRelease,
  countryCode: orEmptyString(input.countryCode)
});

const countryIsNotOnBlackList = (input: WithValidatedCountryCode): boolean =>
  !countryBlackList.includes(input.countryCode);

const bandIsAMetalBand = (input: WithValidatedCountryCode): boolean =>
  isMetal.isMetal.runWith(input.maEntry.Genre);

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

const hasNoEmptyGenre = (input: WithGenreList) => input.genres.length > 0;

const obs = getBandStream(locationOfMetalArchivesExport)
  .pipe(map(parseReleaseDates))
  .pipe(filter(hasReleases))
  .pipe(map(getCountryCodes))
  .pipe(map(getCountryCode))
  .pipe(filter(countryCodeIsRight))
  .pipe(map(unpackCountryCode))
  .pipe(filter(countryIsNotOnBlackList))
  .pipe(filter(bandIsAMetalBand))
  .pipe(map(getGenres))
  .pipe(filter(hasNoEmptyGenre))
  .pipe(map(toString));

rxToStream(obs).pipe(process.stdout);
