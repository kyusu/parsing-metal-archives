import getBandStream from "./readFromStream";
import { rxToStream } from "rxjs-stream";
import path from "path";
import { filter, map } from "rxjs/operators";
import {
  CleanedUpMetalArchivesEntry,
  CountryCode,
  MetalArchivesEntry,
  WithCountryCode,
  WithCountryCodes,
  WithParsedYears,
  WithValidatedCountryCode
} from "./types/Band";
import countryMapper from "country-mapper";
import { getCode } from "country-list";
import { getOrElse, isRight, left, right } from "fp-ts/lib/Either";

const metalArchivesExport: "band_20190607.csv" = "band_20190607.csv";

const locationOfMetalArchivesExport = path.join(
  __dirname,
  "..",
  "..",
  metalArchivesExport
);

const toString = (input: WithValidatedCountryCode): string =>
  JSON.stringify(input, null, 4);

const toCleanedUp = (
  input: MetalArchivesEntry
): CleanedUpMetalArchivesEntry => ({
  "Band name": input["Band name"],
  Genre: input.Genre,
  Country: input.Country,
  "First release": input["First release"],
  "Latest release": input["Latest release"]
});

const parseReleaseDates = (
  input: CleanedUpMetalArchivesEntry
): WithParsedYears => ({
  "Band name": input["Band name"],
  Genre: input.Genre,
  Country: input.Country,
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
    countryMapper.convert(input.Country) || "",
    getCode(input.Country) || "",
    customCountryMapper(input.Country) || ""
  ].filter(code => !!code);
  return {
    "Band name": input["Band name"],
    Genre: input.Genre,
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
    "Band name": input["Band name"],
    Genre: input.Genre,
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
  "Band name": input["Band name"],
  Genre: input.Genre,
  latestRelease: input.latestRelease,
  firstRelease: input.firstRelease,
  countryCode: orEmptyString(input.countryCode)
});

const obs = getBandStream(locationOfMetalArchivesExport)
  .pipe(map(toCleanedUp))
  .pipe(map(parseReleaseDates))
  .pipe(filter(hasReleases))
  .pipe(map(getCountryCodes))
  .pipe(map(getCountryCode))
  .pipe(filter(countryCodeIsRight))
  .pipe(map(unpackCountryCode))
  .pipe(map(toString));

rxToStream(obs).pipe(process.stdout);
