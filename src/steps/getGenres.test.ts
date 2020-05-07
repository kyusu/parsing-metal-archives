import getGenres from "./getGenres";
import { factory } from "factoree";
import {
  BandInProcessingStep,
  MetalArchivesEntry,
  WithGenreList,
  WithValidatedCountryCode
} from "../types/Band";
import { left, right } from "fp-ts/lib/Either";

const createMetalArchivesEntry = factory<MetalArchivesEntry>({
  Genre: undefined
});
const createWithValidatedCountryCode = factory<WithValidatedCountryCode>({
  maEntry: undefined
});
const createWithGenreList = factory<WithGenreList>({ genres: undefined });

describe("getGenres", () => {
  it("should return a list of genres if the band is in the relevant genres", () => {
    const metalArchivesEntry = createMetalArchivesEntry({
      Genre:
        "Death Metal (early); Black Metal (mid); Black/Heavy/Speed Metal (later)"
    });
    const withRelevantGenre = createWithValidatedCountryCode({
      maEntry: metalArchivesEntry
    });
    const result = getGenres(withRelevantGenre);
    expect<BandInProcessingStep<WithGenreList>>(result).toEqual<
      BandInProcessingStep<WithGenreList>
    >(
      right(
        createWithGenreList({
          genres: ["Black Metal", "Death Metal", "Heavy Metal", "Speed Metal"],
          maEntry: metalArchivesEntry
        })
      )
    );
  });

  it("should return an empty list of genres if the band is not in the relevant genres", () => {
    const metalArchivesEntry = createMetalArchivesEntry({
      Genre: "Ambient, Psychedelic, Noise"
    });
    const withIrrelevantGenre = createWithValidatedCountryCode({
      maEntry: metalArchivesEntry
    });
    const result = getGenres(withIrrelevantGenre);
    expect<BandInProcessingStep<WithGenreList>>(result).toEqual<
      BandInProcessingStep<WithGenreList>
    >(
      left({
        maEntry: metalArchivesEntry,
        reason: "Not in a relevant genre"
      })
    );
  });
});
