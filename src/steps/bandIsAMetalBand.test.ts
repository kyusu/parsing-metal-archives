import bandIsAMetalBand from "./bandIsAMetalBand";
import { factory } from "factoree";
import {
  BandInProcessingStep,
  FilteredOutEntry,
  MetalArchivesEntry,
  WithValidatedCountryCode
} from "../types/Band";
import { left, right } from "fp-ts/lib/Either";

const createMetalArchiveEntry = factory<MetalArchivesEntry>({
  Genre: undefined
});

const createWithValidatedCountryCode = factory<WithValidatedCountryCode>({
  maEntry: undefined,
  countryCode: undefined
});
const createFilteredOutEntry = factory<FilteredOutEntry>({
  maEntry: undefined,
  reason: undefined
});

describe("bandIsAMetalBand", () => {
  it("should wrap the entry in a right if it is a metal band", () => {
    const metalBand = createWithValidatedCountryCode({
      maEntry: createMetalArchiveEntry({
        Genre: "Black Metal"
      })
    });
    const result = bandIsAMetalBand(metalBand);
    expect<BandInProcessingStep<WithValidatedCountryCode>>(result).toEqual(
      right(metalBand)
    );
  });

  it("should wrap the entry in a left if it is not a metal band", () => {
    const maEntry = createMetalArchiveEntry({
      Genre: "Stoner Rock"
    });
    const stonerRockBand = createWithValidatedCountryCode({
      maEntry
    });
    const result = bandIsAMetalBand(stonerRockBand);
    expect<BandInProcessingStep<WithValidatedCountryCode>>(result).toEqual(
      left(createFilteredOutEntry({ reason: "Not a metal band", maEntry }))
    );
  });
});
