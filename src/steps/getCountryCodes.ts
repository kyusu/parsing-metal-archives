import { WithCountryCodes, WithParsedYears } from "../types/Band";
import countryMapper from "country-mapper";
import { getCode } from "country-list";

const customCountryMapping: Record<string, string> = {
  "Korea, South": "KR",
  Svalbard: "NO"
};
const customCountryMapper = (country: string): string | undefined =>
  customCountryMapping[country];

const getCountryCodes = (input: WithParsedYears): WithCountryCodes => {
  const codes: string[] = [
    countryMapper.convert(input.maEntry.Country) || "",
    getCode(input.maEntry.Country) || "",
    customCountryMapper(input.maEntry.Country) || ""
  ].filter(code => code !== "");
  return {
    countryCodes: new Set(codes),
    ...input
  };
};

export default getCountryCodes;
