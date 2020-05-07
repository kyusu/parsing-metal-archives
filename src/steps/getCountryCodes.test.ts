import getCountryCodes from "./getCountryCodes";
import { factory } from "factoree";
import { MetalArchivesEntry, WithParsedYears } from "../types/Band";

const createMetalArchivesEntry = factory<MetalArchivesEntry>({
  Country: undefined
});
const createWithParsedYears = factory<WithParsedYears>({
  maEntry: createMetalArchivesEntry({})
});

describe("getCountryCodes", () => {
  it("should map the given (and valid) country name to ISO-3166 country codes", () => {
    const withValidCountry = createWithParsedYears({
      maEntry: createMetalArchivesEntry({ Country: "Uruguay" })
    });
    const result = getCountryCodes(withValidCountry);
    expect<Set<string>>(result.countryCodes).toEqual<Set<string>>(
      new Set(["UY"])
    );
    expect<MetalArchivesEntry>(result.maEntry).toEqual<MetalArchivesEntry>(
      withValidCountry.maEntry
    );
  });

  it("should return an empty set if the country is not valid", () => {
    const withInvalidCountry = createWithParsedYears({
      maEntry: createMetalArchivesEntry({ Country: "International" })
    });
    const result = getCountryCodes(withInvalidCountry);
    expect<Set<string>>(result.countryCodes).toEqual<Set<string>>(new Set());
    expect<MetalArchivesEntry>(result.maEntry).toEqual<MetalArchivesEntry>(
      withInvalidCountry.maEntry
    );
  });

  it('should map the string "Korea, South" to the ISO-3166 country code of South Korea', () => {
    const withKoreaSouth = createWithParsedYears({
      maEntry: createMetalArchivesEntry({ Country: "Korea, South" })
    });
    const result = getCountryCodes(withKoreaSouth);
    expect<Set<string>>(result.countryCodes).toEqual<Set<string>>(
      new Set(["KR"])
    );
    expect<MetalArchivesEntry>(result.maEntry).toEqual<MetalArchivesEntry>(
      withKoreaSouth.maEntry
    );
  });

  it('should map the string "Svalbard" to the ISO-3166 country code of Norway', () => {
    const withSvalbard = createWithParsedYears({
      maEntry: createMetalArchivesEntry({ Country: "Svalbard" })
    });
    const result = getCountryCodes(withSvalbard);
    expect<Set<string>>(result.countryCodes).toEqual<Set<string>>(
      new Set(["NO"])
    );
    expect<MetalArchivesEntry>(result.maEntry).toEqual<MetalArchivesEntry>(
      withSvalbard.maEntry
    );
  });
});
