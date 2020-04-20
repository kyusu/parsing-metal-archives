import {
  IncludedBand,
  MetalArchivesEntry,
  RejectionReasons,
  WithGenreList
} from "./Band";

export type ReducedBands = {
  filteredOut: Record<RejectionReasons, MetalArchivesEntry[]>;
  includedBands: WithGenreList[];
};

export type WithIncludedBands = Omit<ReducedBands, "includedBands"> & {
  includedBands: IncludedBand[];
};

export type Overview = {};
