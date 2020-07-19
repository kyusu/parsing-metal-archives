import countRejections from "./countRejections";
import { factory } from "factoree";
import {
  ReducedBands,
  ReducedBandsWithRejectionsCounts
} from "../types/Overview";

const createReducedBands = factory<ReducedBands>({
  includedBands: undefined,
  filteredOut: undefined
});

describe("countRejections", () => {
  it("should count all rejected values", () => {
    const reducedBands = createReducedBands({
      filteredOut: {
        "Not in a relevant genre": [
          "Progressive Metal",
          "Groove Metal",
          "Symphonic Metal",
          "Groove Metal",
          "Progressive Metal",
          "Progressive Metal"
        ],
        "No releases found": [
          "first release: N/A, latest release: N/A",
          "first release: N/A, latest release: N/A",
          "first release: N/A, latest release: N/A",
          "first release: N/A, latest release: N/A"
        ],
        "Not a metal band": [
          "Death 'n' Roll",
          "Death 'n' Roll",
          "Death 'n' Roll",
          "Metalcore",
          "Metalcore",
          "Brutal Deathcore"
        ],
        "Country could not be parsed": [
          "International",
          "International",
          "International",
          "Unknown"
        ],
        "Country is too small": [
          "Singapore",
          "Singapore",
          "Singapore",
          "Åland Islands"
        ]
      }
    });
    const result = countRejections(reducedBands);
    expect(result).toEqual<ReducedBandsWithRejectionsCounts>({
      includedBands: reducedBands.includedBands,
      filteredOut: {
        "No releases found": {
          "first release: N/A, latest release: N/A": 4
        },
        "Not a metal band": {
          "Death 'n' Roll": 3,
          Metalcore: 2,
          "Brutal Deathcore": 1
        },
        "Country could not be parsed": {
          International: 3,
          Unknown: 1
        },
        "Country is too small": {
          Singapore: 3,
          "Åland Islands": 1
        },
        "Not in a relevant genre": {
          "Progressive Metal": 3,
          "Symphonic Metal": 1,
          "Groove Metal": 2
        }
      }
    });
  });
});
