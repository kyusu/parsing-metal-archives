import { IncludedBand, MetalArchivesEntry, RejectionReasons } from "./Band";

export type Overview = {
  filteredOut: Record<RejectionReasons, MetalArchivesEntry[]>;
  includedBands: IncludedBand[];
};
