import hashMetalArchivesEntry from "./hashMetalArchivesEntry";
import { factory } from "factoree";
import {
  ReducedBandsWithRejectionsCounts,
  WithIncludedBands
} from "../types/Overview";
import { MetalArchivesEntry, WithGenreList } from "../types/Band";

const createReducedBandsWithRejectionCounts = factory<
  ReducedBandsWithRejectionsCounts
>({
  includedBands: undefined,
  filteredOut: undefined
});

const createWithGenreList = factory<WithGenreList>({
  firstRelease: undefined,
  latestRelease: undefined,
  countryCode: undefined,
  genres: undefined,
  maEntry: undefined
});

describe("hashMetalArchivesEntry", () => {
  it("should hash the MetalArchivesEntry property", () => {
    const ironMaiden: MetalArchivesEntry = {
      "Band name": "Iron Maiden",
      Genre: "Heavy Metal, NWOBHM",
      Country: "United Kingdom",
      Status: "Active",
      "Formed in": "1975",
      "Years active": "1975-present",
      "First release": "1979",
      "Latest release": "2017",
      Location: "London"
    };
    const darkthrone: MetalArchivesEntry = {
      "Band name": "Darkthrone",
      Genre:
        "Death Metal (early); Black Metal (mid); Black/Heavy/Speed Metal (later)",
      Country: "Norway",
      Status: "Active",
      "Formed in": "1987",
      "Years active": "1986-1987 (as Black Death), 1987-present",
      "First release": "1988",
      "Latest release": "2019",
      Location: "Bergen"
    };
    const reducedBandsWithRejectionsCounts = createReducedBandsWithRejectionCounts(
      {
        includedBands: [
          createWithGenreList({ maEntry: ironMaiden }),
          createWithGenreList({ maEntry: darkthrone })
        ]
      }
    );

    const result = hashMetalArchivesEntry(reducedBandsWithRejectionsCounts);
    expect(result).toEqual<WithIncludedBands>({
      filteredOut: reducedBandsWithRejectionsCounts.filteredOut,
      includedBands: [
        {
          countryCode:
            reducedBandsWithRejectionsCounts.includedBands[0].countryCode,
          latestRelease:
            reducedBandsWithRejectionsCounts.includedBands[0].latestRelease,
          firstRelease:
            reducedBandsWithRejectionsCounts.includedBands[0].firstRelease,
          genres: reducedBandsWithRejectionsCounts.includedBands[0].genres,
          id: "208042420556e84d33702956b70bc220e026414b"
        },
        {
          countryCode:
            reducedBandsWithRejectionsCounts.includedBands[1].countryCode,
          latestRelease:
            reducedBandsWithRejectionsCounts.includedBands[1].latestRelease,
          firstRelease:
            reducedBandsWithRejectionsCounts.includedBands[1].firstRelease,
          genres: reducedBandsWithRejectionsCounts.includedBands[1].genres,
          id: "3521035e8bfc2e880e1a0c90a810f98ef086712c"
        }
      ]
    });
  });
});
