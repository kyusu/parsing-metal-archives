import {
  ReducedBands,
  ReducedBandsWithRejectionsCounts
} from "../types/Overview";
import * as R from "ramda";
import { identity } from "fp-ts/lib/function";

const countRejects = (rejectedValues: string[]): Record<string, number> => {
  return R.countBy<string>(identity)(rejectedValues);
};

const countRejections = (
  reducedBands: ReducedBands
): ReducedBandsWithRejectionsCounts => {
  return {
    filteredOut: {
      "Country could not be parsed": countRejects(
        reducedBands.filteredOut["Country could not be parsed"]
      ),
      "Country is too small": countRejects(
        reducedBands.filteredOut["Country is too small"]
      ),
      "No releases found": countRejects(
        reducedBands.filteredOut["No releases found"]
      ),
      "Not a metal band": countRejects(
        reducedBands.filteredOut["Not a metal band"]
      ),
      "Not in a relevant genre": countRejects(
        reducedBands.filteredOut["Not in a relevant genre"]
      )
    },
    includedBands: reducedBands.includedBands
  };
};

export default countRejections;
