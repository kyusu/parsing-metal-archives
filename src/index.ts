import getBandStream from "./readFromStream";
import { rxToStream } from "rxjs-stream";
import path from "path";
import { map, filter } from "rxjs/operators";
import {
  CleanedUpMetalArchivesEntry,
  MetalArchivesEntry,
  WithParsedYears
} from "./types/Band";

const metalArchivesExport: "band_20190607.csv" = "band_20190607.csv";

const locationOfMetalArchivesExport = path.join(
  __dirname,
  "..",
  "..",
  metalArchivesExport
);

const toString = (input: WithParsedYears): string =>
  JSON.stringify(input, null, 4);

const toCleanedUp = (
  input: MetalArchivesEntry
): CleanedUpMetalArchivesEntry => ({
  "Band name": input["Band name"],
  Genre: input.Genre,
  Country: input.Country,
  "First release": input["First release"],
  "Latest release": input["Latest release"]
});

const parseReleaseDates = (
  input: CleanedUpMetalArchivesEntry
): WithParsedYears => ({
  "Band name": input["Band name"],
  Genre: input.Genre,
  Country: input.Country,
  firstRelease: parseInt(input["First release"], 10),
  latestRelease: parseInt(input["Latest release"], 10)
});

const hasReleases = (input: WithParsedYears): boolean =>
  !(Number.isNaN(input.firstRelease) && Number.isNaN(input.latestRelease));

const obs = getBandStream(locationOfMetalArchivesExport)
  .pipe(map(toCleanedUp))
  .pipe(map(parseReleaseDates))
  .pipe(filter(hasReleases))
  .pipe(map(toString));

rxToStream(obs).pipe(process.stdout);
