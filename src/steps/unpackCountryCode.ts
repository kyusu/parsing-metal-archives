import {
  BandInProcessingStep,
  CountryCode,
  WithCountryCode,
  WithValidatedCountryCode
} from "../types/Band";
import { getOrElse, left, right } from "fp-ts/lib/Either";
import { absurd } from "fp-ts/lib/function";

const orEmptyString: (ma: CountryCode) => string = getOrElse(() => "");

const unpackCountryCode = (
  input: WithCountryCode
): BandInProcessingStep<WithValidatedCountryCode> => {
  switch (input.countryCode._tag) {
    case "Right":
      return right({
        maEntry: input.maEntry,
        latestRelease: input.latestRelease,
        firstRelease: input.firstRelease,
        countryCode: orEmptyString(input.countryCode)
      });
    case "Left":
      return left({
        maEntry: input.maEntry,
        reason: "Country could not be parsed"
      });
    default:
      return absurd(input.countryCode);
  }
};

export default unpackCountryCode;
