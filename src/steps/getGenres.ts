import { Genres, WithGenreList, WithValidatedCountryCode } from "../types/Band";
import { none, Option, some } from "fp-ts/lib/Option";
import { absurd } from "fp-ts/lib/function";
import {
  isBlackMetal,
  isDeathMetal,
  isDoomMetal,
  isHeavyMetal,
  isPowerMetal,
  isSpeedMetal,
  isThrashMetal
} from "ordo-ab-chao";

const classifiers: ((genre: string) => Option<Genres>)[] = [
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
];

const getGenres = (input: WithValidatedCountryCode): WithGenreList => {
  const optGenres: Option<Genres>[] = classifiers.map(fn =>
    fn(input.maEntry.Genre)
  );
  const genres = optGenres.reduce((acc: Genres[], value: Option<Genres>) => {
    switch (value._tag) {
      case "None":
        break;
      case "Some":
        acc.push(value.value);
        break;
      default:
        absurd(value);
        break;
    }
    return acc;
  }, []);
  return {
    maEntry: input.maEntry,
    firstRelease: input.firstRelease,
    latestRelease: input.latestRelease,
    countryCode: input.countryCode,
    genres: genres
  };
};

export default getGenres;
