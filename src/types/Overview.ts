import { IncludedBand, RejectionReasons, WithGenreList } from "./Band";

export type ReducedBands = {
  filteredOut: { reasons: Record<RejectionReasons, string[]>; total: number };
  includedBands: WithGenreList[];
};

export type ReducedBandsWithRejectionsCounts = Omit<
  ReducedBands,
  "filteredOut"
> & {
  filteredOut: {
    reasons: Record<RejectionReasons, Record<string, number>>;
    total: number;
  };
};

export type WithIncludedBands = Omit<ReducedBands, "includedBands"> & {
  includedBands: IncludedBand[];
};

export type Overview = {};
