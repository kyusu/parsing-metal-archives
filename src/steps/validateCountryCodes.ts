import {
  BandInProcessingStep,
  WithCountryCodes,
  WithValidatedCountryCode
} from "../types/Band";
import { left, right } from "fp-ts/lib/Either";

const validateCountryCodes = (
  input: WithCountryCodes
): BandInProcessingStep<WithValidatedCountryCode> =>
  input.countryCodes.size === 1
    ? right({
        maEntry: input.maEntry,
        latestRelease: input.latestRelease,
        firstRelease: input.firstRelease,
        countryCode: input.countryCodes.values().next().value
      })
    : left({
        maEntry: input.maEntry,
        reason: "Country could not be parsed"
      });

export default validateCountryCodes;
