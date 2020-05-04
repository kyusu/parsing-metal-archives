import { IncludedBand, RejectionReasons, WithGenreList } from "./Band";

export type ReducedBands = {
  filteredOut: Record<RejectionReasons, string[]>;
  includedBands: WithGenreList[];
};

export type ReducedBandsWithRejectionsCounts = Omit<
  ReducedBands,
  "filteredOut"
> & {
  filteredOut: Record<RejectionReasons, Record<string, number>>;
};

export type WithIncludedBands = Omit<
  ReducedBandsWithRejectionsCounts,
  "includedBands"
> & {
  includedBands: IncludedBand[];
};

export type Overview = {};
