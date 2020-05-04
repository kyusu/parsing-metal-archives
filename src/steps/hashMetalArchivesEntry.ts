import {
  ReducedBandsWithRejectionsCounts,
  WithIncludedBands
} from "../types/Overview";
import { IncludedBand } from "../types/Band";
import hash from "object-hash";

const hashMetalArchivesEntry: (
  bands: ReducedBandsWithRejectionsCounts
) => WithIncludedBands = bands => {
  const hashedMAEntries = bands.includedBands.map(
    (band): IncludedBand => ({
      sha1: hash(band.maEntry),
      firstRelease: band.firstRelease,
      latestRelease: band.latestRelease,
      countryCode: band.countryCode,
      genres: band.genres
    })
  );
  return {
    includedBands: hashedMAEntries,
    filteredOut: bands.filteredOut
  };
};

export default hashMetalArchivesEntry;
