import { ReducedBands } from "../types/Overview";
import { BandInProcessingStep, WithGenreList } from "../types/Band";
import { absurd } from "fp-ts/lib/function";

const toReducedBands = (
  acc: ReducedBands,
  input: BandInProcessingStep<WithGenreList>
): ReducedBands => {
  switch (input._tag) {
    case "Left":
      switch (input.left.reason) {
        case "Country could not be parsed":
          acc.filteredOut.reasons["Country could not be parsed"].push(
            input.left.maEntry.Country
          );
          break;
        case "Country is too small":
          acc.filteredOut.reasons["Country is too small"].push(
            input.left.maEntry.Country
          );
          break;
        case "No releases found":
          acc.filteredOut.reasons["No releases found"].push(
            `first release: ${input.left.maEntry["First release"]}, latest release: ${input.left.maEntry["Latest release"]}`
          );
          break;
        case "Not a metal band":
          acc.filteredOut.reasons["Not a metal band"].push(
            input.left.maEntry.Genre
          );
          break;
        case "Not in a relevant genre":
          acc.filteredOut.reasons["Not in a relevant genre"].push(
            input.left.maEntry.Genre
          );
          break;
        default:
          absurd(input.left.reason);
          break;
      }
      break;
    case "Right":
      acc.includedBands.push(input.right);
      break;
    default:
      absurd(input);
      break;
  }
  return acc;
};

export default toReducedBands;
