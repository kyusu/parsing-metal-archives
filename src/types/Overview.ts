import { MetalArchivesEntry, RejectionReasons, WithGenreList } from "./Band";

export type Overview = {
  filteredOut: Record<RejectionReasons, MetalArchivesEntry[]>;
  includedBands: WithGenreList[];
};
