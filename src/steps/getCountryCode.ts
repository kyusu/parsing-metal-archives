import { CountryCode, WithCountryCode, WithCountryCodes } from "../types/Band";
import { left, right } from "fp-ts/lib/Either";

const getCountryCode = (input: WithCountryCodes): WithCountryCode => {
  const code: CountryCode =
    input.countryCodes.size === 1
      ? right(input.countryCodes.values().next().value)
      : left("Country could not be parsed");
  return {
    maEntry: input.maEntry,
    firstRelease: input.firstRelease,
    latestRelease: input.latestRelease,
    countryCode: code
  };
};

export default getCountryCode;
