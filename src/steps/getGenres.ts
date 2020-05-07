import {
  BandInProcessingStep,
  FilteredOutEntry,
  Genres,
  WithGenreList,
  WithValidatedCountryCode
} from "../types/Band";
import { isSome, none, Option, option, some } from "fp-ts/lib/Option";
import { absurd } from "fp-ts/lib/function";
import { array } from "fp-ts/lib/Array";
import {
  isBlackMetal,
  isDeathMetal,
  isDoomMetal,
  isHeavyMetal,
  isPowerMetal,
  isSpeedMetal,
  isThrashMetal
} from "ordo-ab-chao";
import { left, right } from "fp-ts/lib/Either";

const classifiers = [
  (genre: string): Option<Genres> =>
    isBlackMetal.runWith(genre) ? some("Black Metal") : none,
  (genre: string): Option<Genres> =>
    isDeathMetal.runWith(genre) ? some("Death Metal") : none,
  (genre: string): Option<Genres> =>
    isDoomMetal.runWith(genre) ? some("Doom Metal") : none,
  (genre: string): Option<Genres> =>
    isHeavyMetal.runWith(genre) ? some("Heavy Metal") : none,
  (genre: string): Option<Genres> =>
    isPowerMetal.runWith(genre) ? some("Power Metal") : none,
  (genre: string): Option<Genres> =>
    isSpeedMetal.runWith(genre) ? some("Speed Metal") : none,
  (genre: string): Option<Genres> =>
    isThrashMetal.runWith(genre) ? some("Thrash Metal") : none
] as const;

const getGenres = (
  input: WithValidatedCountryCode
): BandInProcessingStep<WithGenreList> => {
  const optGenres: Option<Genres>[] = classifiers
    .map(fn => fn(input.maEntry.Genre))
    .filter(isSome);

  const genres = array.sequence(option)(optGenres.length ? optGenres : [none]);
  switch (genres._tag) {
    case "Some":
      return right({
        ...input,
        genres: genres.value
      });
    case "None":
      return left<FilteredOutEntry>({
        reason: "Not in a relevant genre",
        maEntry: input.maEntry
      });
    default:
      return absurd(genres);
  }
};

export default getGenres;
