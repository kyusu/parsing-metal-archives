import {
  BandInProcessingStep,
  CountryCode,
  WithCountryCode,
  WithCountryCodes
} from "../types/Band";
import { left, map as eMap, right } from "fp-ts/lib/Either";

const getCountryCode = (
  input: BandInProcessingStep<WithCountryCodes>
): BandInProcessingStep<WithCountryCode> => {
  const mapper = eMap((entry: WithCountryCodes) => {
    const code: CountryCode =
      entry.countryCodes.size === 1
        ? right(entry.countryCodes.values().next().value)
        : left("Country could not be parsed");
    return {
      maEntry: entry.maEntry,
      firstRelease: entry.firstRelease,
      latestRelease: entry.latestRelease,
      countryCode: code
    };
  });
  return mapper(input);
};

export default getCountryCode;
