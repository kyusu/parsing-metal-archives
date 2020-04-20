import { IncludedBand, RejectionReasons, WithGenreList } from "./Band";

export type ReducedBands = {
  filteredOut: Record<RejectionReasons, string[]>;
  includedBands: WithGenreList[];
};

export type WithIncludedBands = Omit<ReducedBands, "includedBands"> & {
  includedBands: IncludedBand[];
};

export type Overview = {};
