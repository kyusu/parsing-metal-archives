import getBandStream from "./readFromStream";
import { rxToStream } from "rxjs-stream";
import path from "path";
import * as Rx from "rxjs/operators";
import { FilteredOutEntry, WithGenreList } from "./types/Band";
import * as E from "fp-ts/lib/Either";
import { ReducedBands } from "./types/Overview";
import {
  bandIsAMetalBand,
  countRejections,
  countryIsNotOnBlackList,
  validateCountryCodes,
  getCountryCodes,
  getGenres,
  hashMetalArchivesEntry,
  hasNoEmptyGenre,
  hasReleases,
  parseReleaseDates,
  toReducedBands,
  toString
} from "./steps";

const metalArchivesExport = "band_20190607.csv";

const locationOfMetalArchivesExport = path.join(
  __dirname,
  "..",
  "..",
  metalArchivesExport
);

const initialValue = {
  filteredOut: {
    "Country could not be parsed": [],
    "No releases found": [],
    "Country is too small": [],
    "Not a metal band": [],
    "Not in a relevant genre": []
  },
  includedBands: []
};

const obs = getBandStream(locationOfMetalArchivesExport)
  .pipe(Rx.map(parseReleaseDates))
  .pipe(Rx.map(hasReleases))
  .pipe(Rx.map(E.map(getCountryCodes)))
  .pipe(Rx.map(E.chain(validateCountryCodes)))
  .pipe(Rx.map(E.chain(countryIsNotOnBlackList)))
  .pipe(Rx.map(E.chain(bandIsAMetalBand)))
  .pipe(Rx.map(E.map(getGenres)))
  .pipe(Rx.map(E.chain(hasNoEmptyGenre)))
  .pipe(
    Rx.reduce<E.Either<FilteredOutEntry, WithGenreList>, ReducedBands>(
      toReducedBands,
      initialValue
    )
  )
  .pipe(Rx.map(countRejections))
  .pipe(Rx.map(hashMetalArchivesEntry))
  .pipe(Rx.map(toString));

rxToStream(obs).pipe(process.stdout);
