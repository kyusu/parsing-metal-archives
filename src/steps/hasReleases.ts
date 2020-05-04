import { BandInProcessingStep, WithParsedYears } from "../types/Band";
import { left, right } from "fp-ts/lib/Either";

const hasReleases = (
  input: WithParsedYears
): BandInProcessingStep<WithParsedYears> =>
  Number.isNaN(input.firstRelease) || Number.isNaN(input.latestRelease)
    ? left({
        reason: "No releases found",
        maEntry: input.maEntry
      })
    : right(input);

export default hasReleases;
