import getBandStream from "./readFromStream";
import { rxToStream } from "rxjs-stream";
import path from "path";
import { map as rMap, reduce as rReduce } from "rxjs/operators";
import { FilteredOutEntry, WithGenreList } from "./types/Band";
import { chain, Either, map as eMap } from "fp-ts/lib/Either";
import { ReducedBands } from "./types/Overview";
import {
  bandIsAMetalBand,
  countRejections,
  countryIsNotOnBlackList,
  getCountryCode,
  getCountryCodes,
  getGenres,
  hashMetalArchivesEntry,
  hasNoEmptyGenre,
  hasReleases,
  parseReleaseDates,
  toReducedBands,
  toString,
  unpackCountryCode
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
  .pipe(rMap(parseReleaseDates))
  .pipe(rMap(hasReleases))
  .pipe(rMap(getCountryCodes))
  .pipe(rMap(getCountryCode))
  .pipe(rMap(chain(unpackCountryCode)))
  .pipe(rMap(chain(countryIsNotOnBlackList)))
  .pipe(rMap(chain(bandIsAMetalBand)))
  .pipe(rMap(eMap(getGenres)))
  .pipe(rMap(chain(hasNoEmptyGenre)))
  .pipe(
    rReduce<Either<FilteredOutEntry, WithGenreList>, ReducedBands>(
      toReducedBands,
      initialValue
    )
  )
  .pipe(rMap(countRejections))
  .pipe(rMap(hashMetalArchivesEntry))
  .pipe(rMap(toString));

rxToStream(obs).pipe(process.stdout);
