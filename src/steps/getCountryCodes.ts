import {
  BandInProcessingStep,
  WithCountryCodes,
  WithParsedYears
} from "../types/Band";
import { map as eMap } from "fp-ts/lib/Either";
import countryMapper from "country-mapper";
import { getCode } from "country-list";

const customCountryMapping: Record<string, string> = {
  "Korea, South": "KR",
  Svalbard: "NO"
};
const customCountryMapper = (country: string): string | undefined =>
  customCountryMapping[country];

const getCountryCodes = (
  input: BandInProcessingStep<WithParsedYears>
): BandInProcessingStep<WithCountryCodes> => {
  const mapper = eMap((entry: WithParsedYears) => {
    const codes: string[] = [
      countryMapper.convert(entry.maEntry.Country) || "",
      getCode(entry.maEntry.Country) || "",
      customCountryMapper(entry.maEntry.Country) || ""
    ].filter(code => code !== "");
    return {
      maEntry: entry.maEntry,
      firstRelease: entry.firstRelease,
      latestRelease: entry.latestRelease,
      countryCodes: new Set(codes)
    };
  });
  return mapper(input);
};

export default getCountryCodes;
