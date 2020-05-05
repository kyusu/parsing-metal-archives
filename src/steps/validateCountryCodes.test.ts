import validateCountryCodes from "./validateCountryCodes";
import { factory } from "factoree";
import {
  BandInProcessingStep,
  FilteredOutEntry,
  MetalArchivesEntry,
  WithCountryCodes,
  WithValidatedCountryCode
} from "../types/Band";
import { left, right } from "fp-ts/lib/Either";

const createMetalArchivesEntry = factory<MetalArchivesEntry>({});

const createWithCountryCodes = factory<WithCountryCodes>({
  maEntry: createMetalArchivesEntry({}),
  firstRelease: undefined,
  latestRelease: undefined,
  countryCodes: undefined
});

const createWithValidatedCountryCode = factory<WithValidatedCountryCode>({
  countryCode: undefined,
  firstRelease: undefined,
  latestRelease: undefined,
  maEntry: createMetalArchivesEntry({})
});

const createFilteredOutEntry = factory<FilteredOutEntry>({
  reason: undefined,
  maEntry: createMetalArchivesEntry({})
});

describe("validateCountryCodes", () => {
  it("should wrap the country codes into a right if the country could be clearly determined", () => {
    const withUniqueCountryCode = createWithCountryCodes({
      countryCodes: new Set(["BR"])
    });
    const result = validateCountryCodes(withUniqueCountryCode);
    expect<BandInProcessingStep<WithValidatedCountryCode>>(result).toEqual(
      right(
        createWithValidatedCountryCode({
          countryCode: "BR"
        })
      )
    );
  });

  it("should wrap the country codes into a left if the country could not be clearly determined", () => {
    const withNonUniqueCountryCode = createWithCountryCodes({
      countryCodes: new Set(["BR", "KR"])
    });
    const result = validateCountryCodes(withNonUniqueCountryCode);
    expect<BandInProcessingStep<WithValidatedCountryCode>>(result).toEqual(
      left(createFilteredOutEntry({ reason: "Country could not be parsed" }))
    );
  });

  it("should wrap the country codes into a left if no countries could be determined", () => {
    const withEmptySet = createWithCountryCodes({
      countryCodes: new Set()
    });
    const result = validateCountryCodes(withEmptySet);
    expect<BandInProcessingStep<WithValidatedCountryCode>>(result).toEqual(
      left(createFilteredOutEntry({ reason: "Country could not be parsed" }))
    );
  });
});
