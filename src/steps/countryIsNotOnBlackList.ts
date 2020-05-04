import {
  BandInProcessingStep,
  FilteredOutEntry,
  WithValidatedCountryCode
} from "../types/Band";
import countryBlackList from "../countryBlackList.json";
import { left, right } from "fp-ts/lib/Either";

const countryIsNotOnBlackList = (
  input: WithValidatedCountryCode
): BandInProcessingStep<WithValidatedCountryCode> =>
  countryBlackList.includes(input.countryCode)
    ? left<FilteredOutEntry>({
        reason: "Country is too small",
        maEntry: input.maEntry
      })
    : right(input);

export default countryIsNotOnBlackList;
