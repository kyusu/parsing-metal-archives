import getBandStream from "./readFromStream";
import { rxToStream } from "rxjs-stream";
import path from "path";
import { map } from "rxjs/operators";
import { CleanedUpMetalArchivesEntry, MetalArchivesEntry } from "./types/Band";

const metalArchivesExport: "band_20190607.csv" = "band_20190607.csv";

const locationOfMetalArchivesExport = path.join(
  __dirname,
  "..",
  "..",
  metalArchivesExport
);

const toString = (input: CleanedUpMetalArchivesEntry): string =>
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

const obs = getBandStream(locationOfMetalArchivesExport)
  .pipe(map(toCleanedUp))
  .pipe(map(toString));

rxToStream(obs).pipe(process.stdout);
