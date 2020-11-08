import toReducedBand from "./toReducedBand";
import { left, right } from "fp-ts/lib/Either";
import {
  BandInProcessingStep,
  FilteredOutEntry,
  MetalArchivesEntry,
  WithGenreList,
} from "../types/Band";
import { ReducedBands } from "../types/Overview";
import { factory } from "factoree";

const getAccumulator = (): ReducedBands => ({
  filteredOut: {
    "No releases found": [],
    "Country could not be parsed": [],
    "Country is too small": [],
    "Not a metal band": [],
    "Not in a relevant genre": [],
  },
  includedBands: [],
});

describe("toReducedBand", () => {
  it("should move Right values to the included bands array", () => {
    const createValidEntry = factory<WithGenreList>();
    const withGenreList: WithGenreList = createValidEntry({});
    const validEntry: BandInProcessingStep<WithGenreList> = right(
      withGenreList
    );
    const accumulator = getAccumulator();
    const result = toReducedBand(accumulator, validEntry);
    expect<ReducedBands>(result).toEqual<ReducedBands>({
      includedBands: [withGenreList],
      filteredOut: accumulator.filteredOut,
    });
  });

  it("should move 'no releases found' entries of to the fitting array", () => {
    const accumulator = getAccumulator();
    const createFilteredOutEntry = factory<FilteredOutEntry>();
    const createMetalArchiveEntry = factory<MetalArchivesEntry>();
    const filteredOutEntry = left(
      createFilteredOutEntry({
        reason: "No releases found",
        maEntry: createMetalArchiveEntry({
          "First release": "1991",
          "Latest release": "1992",
        }),
      })
    );
    const result = toReducedBand(accumulator, filteredOutEntry);

    expect<ReducedBands>(result).toEqual<ReducedBands>({
      includedBands: [],
      filteredOut: {
        ...accumulator.filteredOut,
        "No releases found": ["first release: 1991, latest release: 1992"],
      },
    });
  });

  it("should move 'country is too small' entries of to the fitting array", () => {
    const accumulator = getAccumulator();
    const createFilteredOutEntry = factory<FilteredOutEntry>();
    const createMetalArchiveEntry = factory<MetalArchivesEntry>();
    const filteredOutEntry = left(
      createFilteredOutEntry({
        reason: "Country is too small",
        maEntry: createMetalArchiveEntry({
          Country: "Absurdistan",
        }),
      })
    );
    const result = toReducedBand(accumulator, filteredOutEntry);

    expect<ReducedBands>(result).toEqual<ReducedBands>({
      includedBands: [],
      filteredOut: {
        ...accumulator.filteredOut,
        "Country is too small": ["Absurdistan"],
      },
    });
  });

  it("should move 'not a metal band' entries of to the fitting array", () => {
    const accumulator = getAccumulator();
    const createFilteredOutEntry = factory<FilteredOutEntry>();
    const createMetalArchiveEntry = factory<MetalArchivesEntry>();
    const filteredOutEntry = left(
      createFilteredOutEntry({
        reason: "Not a metal band",
        maEntry: createMetalArchiveEntry({
          Genre: "Dubstep",
        }),
      })
    );
    const result = toReducedBand(accumulator, filteredOutEntry);

    expect<ReducedBands>(result).toEqual<ReducedBands>({
      includedBands: [],
      filteredOut: {
        ...accumulator.filteredOut,
        "Not a metal band": ["Dubstep"],
      },
    });
  });

  it("should move 'not in a relevant genre' entries of to the fitting array", () => {
    const accumulator = getAccumulator();
    const createFilteredOutEntry = factory<FilteredOutEntry>();
    const createMetalArchiveEntry = factory<MetalArchivesEntry>();
    const filteredOutEntry = left(
      createFilteredOutEntry({
        reason: "Not in a relevant genre",
        maEntry: createMetalArchiveEntry({
          Genre: "Folk Gothic Metal",
        }),
      })
    );
    const result = toReducedBand(accumulator, filteredOutEntry);

    expect<ReducedBands>(result).toEqual<ReducedBands>({
      includedBands: [],
      filteredOut: {
        ...accumulator.filteredOut,
        "Not in a relevant genre": ["Folk Gothic Metal"],
      },
    });
  });

  it("should move 'country could not be parsed' entries of to the fitting array", () => {
    const accumulator = getAccumulator();
    const createFilteredOutEntry = factory<FilteredOutEntry>();
    const createMetalArchiveEntry = factory<MetalArchivesEntry>();
    const filteredOutEntry = left(
      createFilteredOutEntry({
        reason: "Country could not be parsed",
        maEntry: createMetalArchiveEntry({
          Country: "§$§%§$§$",
        }),
      })
    );
    const result = toReducedBand(accumulator, filteredOutEntry);

    expect<ReducedBands>(result).toEqual<ReducedBands>({
      includedBands: [],
      filteredOut: {
        ...accumulator.filteredOut,
        "Country could not be parsed": ["§$§%§$§$"],
      },
    });
  });
});
