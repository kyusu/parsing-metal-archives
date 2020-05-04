import {
  BandInProcessingStep,
  FilteredOutEntry,
  WithGenreList
} from "../types/Band";
import { left, right } from "fp-ts/lib/Either";

const hasNoEmptyGenre = (
  input: WithGenreList
): BandInProcessingStep<WithGenreList> =>
  input.genres.length > 0
    ? right(input)
    : left<FilteredOutEntry>({
        reason: "Not in a relevant genre",
        maEntry: input.maEntry
      });

export default hasNoEmptyGenre;
