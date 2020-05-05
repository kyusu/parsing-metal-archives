import getCountryCode from "./getCountryCode";
import { factory } from "factoree";
import {
  CountryCode,
  MetalArchivesEntry,
  WithCountryCodes
} from "../types/Band";
import { left, right } from "fp-ts/lib/Either";

const createMetalArchivesEntry = factory<MetalArchivesEntry>({});
const createWithCountryCodes = factory<WithCountryCodes>({
  maEntry: createMetalArchivesEntry({}),
  firstRelease: undefined,
  latestRelease: undefined,
  countryCodes: undefined
});

describe("getCountryCode", () => {
  it("should wrap the country codes into a right if the country could be clearly determined", () => {
    const withUniqueCountryCode = createWithCountryCodes({
      countryCodes: new Set(["BR"])
    });
    const result = getCountryCode(withUniqueCountryCode);
    expect<CountryCode>(result.countryCode).toEqual(right("BR"));
  });

  it("should wrap the country codes into a left if the country could not be clearly determined", () => {
    const withNonUniqueCountryCode = createWithCountryCodes({
      countryCodes: new Set(["BR", "KR"])
    });
    const result = getCountryCode(withNonUniqueCountryCode);
    expect<CountryCode>(result.countryCode).toEqual(
      left("Country could not be parsed")
    );
  });

  it("should wrap the country codes into a left if no countries could be determined", () => {
    const withEmptySet = createWithCountryCodes({
      countryCodes: new Set()
    });
    const result = getCountryCode(withEmptySet);
    expect<CountryCode>(result.countryCode).toEqual(
      left("Country could not be parsed")
    );
  });
});
