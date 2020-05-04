import { MetalArchivesEntry, WithParsedYears } from "../types/Band";

const parseReleaseDates = (input: MetalArchivesEntry): WithParsedYears => ({
  maEntry: input,
  firstRelease: parseInt(input["First release"], 10),
  latestRelease: parseInt(input["Latest release"], 10)
});

export default parseReleaseDates;
