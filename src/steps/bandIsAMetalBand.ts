import {
  BandInProcessingStep,
  FilteredOutEntry,
  WithValidatedCountryCode
} from "../types/Band";
import { isMetal } from "ordo-ab-chao";
import { left, right } from "fp-ts/lib/Either";

const bandIsAMetalBand = (
  input: WithValidatedCountryCode
): BandInProcessingStep<WithValidatedCountryCode> =>
  isMetal.isMetal.runWith(input.maEntry.Genre)
    ? right(input)
    : left<FilteredOutEntry>({
        reason: "Not a metal band",
        maEntry: input.maEntry
      });

export default bandIsAMetalBand;
