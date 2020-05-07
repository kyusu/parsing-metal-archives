import hasReleases from "./hasReleases";
import { factory } from "factoree";
import {
  BandInProcessingStep,
  FilteredOutEntry,
  WithParsedYears
} from "../types/Band";
import { left, right } from "fp-ts/lib/Either";

const createWithParsedYears = factory<WithParsedYears>({
  firstRelease: undefined,
  latestRelease: undefined,
  maEntry: undefined
});

describe("hasReleases", () => {
  it("should wrap the release in a Right if it has release dates", () => {
    const withParsedYears = createWithParsedYears({
      firstRelease: 1999,
      latestRelease: 2004
    });
    const result = hasReleases(withParsedYears);
    expect<BandInProcessingStep<WithParsedYears>>(result).toEqual<
      BandInProcessingStep<WithParsedYears>
    >(right(withParsedYears));
  });

  it("should wrap the release in a Left if its has NaN for both release dates", () => {
    const withParsedYears = createWithParsedYears({
      firstRelease: NaN,
      latestRelease: NaN
    });
    const result = hasReleases(withParsedYears);
    expect<BandInProcessingStep<WithParsedYears>>(result).toEqual<
      BandInProcessingStep<WithParsedYears>
    >(
      left<FilteredOutEntry, WithParsedYears>({
        maEntry: withParsedYears.maEntry,
        reason: "No releases found"
      })
    );
  });

  it("should wrap the release in a Left if one of the release dates is NaN", () => {
    const withFirstReleaseAsNaN = createWithParsedYears({
      firstRelease: NaN,
      latestRelease: 1994
    });
    const withLatestReleaseAsNaN = createWithParsedYears({
      firstRelease: 1993,
      latestRelease: NaN
    });
    const firstResult = hasReleases(withFirstReleaseAsNaN);
    const secondResult = hasReleases(withLatestReleaseAsNaN);
    expect<BandInProcessingStep<WithParsedYears>>(firstResult).toEqual<
      BandInProcessingStep<WithParsedYears>
    >(
      left<FilteredOutEntry, WithParsedYears>({
        maEntry: withFirstReleaseAsNaN.maEntry,
        reason: "No releases found"
      })
    );
    expect<BandInProcessingStep<WithParsedYears>>(secondResult).toEqual<
      BandInProcessingStep<WithParsedYears>
    >(
      left<FilteredOutEntry, WithParsedYears>({
        maEntry: withLatestReleaseAsNaN.maEntry,
        reason: "No releases found"
      })
    );
  });
});
