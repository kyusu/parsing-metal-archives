import countryIsNotOnBlackList from "./countryIsNotOnBlackList";
import { factory } from "factoree";
import {
  BandInProcessingStep,
  FilteredOutEntry,
  WithValidatedCountryCode
} from "../types/Band";
import { left, right } from "fp-ts/lib/Either";

const createWithValidatedCountryCode = factory<WithValidatedCountryCode>({
  maEntry: undefined,
  countryCode: undefined
});
const createFilteredOutEntry = factory<FilteredOutEntry>({
  maEntry: undefined,
  reason: undefined
});

describe("countryIsNotOnBlackList", () => {
  it("should wrap the entry in a right if the country of the band is not on the black list", () => {
    const bandFromBrazil = createWithValidatedCountryCode({
      countryCode: "BR"
    });
    const result = countryIsNotOnBlackList(bandFromBrazil);
    expect<BandInProcessingStep<WithValidatedCountryCode>>(result).toEqual<
      BandInProcessingStep<WithValidatedCountryCode>
    >(right(createWithValidatedCountryCode({ countryCode: "BR" })));
  });

  it("should wrap the entry in a left if the country of the band is on the black list", () => {
    const bandFromHongKong = createWithValidatedCountryCode({
      countryCode: "HK"
    });
    const result = countryIsNotOnBlackList(bandFromHongKong);
    expect<BandInProcessingStep<WithValidatedCountryCode>>(result).toEqual<
      BandInProcessingStep<WithValidatedCountryCode>
    >(left(createFilteredOutEntry({ reason: "Country is too small" })));
  });
});
