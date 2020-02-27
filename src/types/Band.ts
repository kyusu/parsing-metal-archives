export type MetalArchivesEntry = {
  "Band name": string;
  Genre: string;
  Country: string;
  Location: string;
  Status: string;
  "Formed in": string;
  "Years active": string;
  "First release": string;
  "Latest release": string;
};

export type CleanedUpMetalArchivesEntry = Omit<
  MetalArchivesEntry,
  "Formed in" | "Location" | "Status" | "Years active"
>;
