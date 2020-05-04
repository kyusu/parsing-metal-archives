import { Either } from "fp-ts/lib/Either";

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

export type WrappedMetalArchivesEntry = {
  maEntry: MetalArchivesEntry;
};

export type RejectionReasons =
  | "No releases found"
  | "Country could not be parsed"
  | "Country is too small"
  | "Not a metal band"
  | "Not in a relevant genre";

export type FilteredOutEntry = WrappedMetalArchivesEntry & {
  reason: RejectionReasons;
};

export type WithParsedYears = WrappedMetalArchivesEntry & {
  firstRelease: number;
  latestRelease: number;
};

export type WithCountryCodes = WithParsedYears & {
  countryCodes: Set<string>;
};

export type CountryCode = Either<"Country could not be parsed", string>;

export type WithCountryCode = Omit<WithCountryCodes, "countryCodes"> & {
  countryCode: CountryCode;
};

export type WithValidatedCountryCode = Omit<WithCountryCode, "countryCode"> & {
  countryCode: string;
};

export type Genres =
  | "Black Metal"
  | "Death Metal"
  | "Doom Metal"
  | "Heavy Metal"
  | "Power Metal"
  | "Speed Metal"
  | "Thrash Metal";

export type WithGenreList = WithValidatedCountryCode & {
  genres: Genres[];
};

export type IncludedBand = Omit<WithGenreList, "maEntry"> & {
  id: string;
};

export type BandInProcessingStep<T> = Either<FilteredOutEntry, T>;
