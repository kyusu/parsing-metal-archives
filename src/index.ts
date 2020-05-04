import getBandStream from "./readFromStream";
import { rxToStream } from "rxjs-stream";
import path from "path";
import { map as rMap, reduce as rReduce } from "rxjs/operators";
import { FilteredOutEntry, WithGenreList } from "./types/Band";
import { chain, Either, map as eMap } from "fp-ts/lib/Either";
import { ReducedBands } from "./types/Overview";
import parseReleaseDates from "./steps/parseReleaseDates";
import hasReleases from "./steps/hasReleases";
import getCountryCodes from "./steps/getCountryCodes";
import getCountryCode from "./steps/getCountryCode";
import unpackCountryCode from "./steps/unpackCountryCode";
import countryIsNotOnBlackList from "./steps/countryIsNotOnBlackList";
import bandIsAMetalBand from "./steps/bandIsAMetalBand";
import getGenres from "./steps/getGenres";
import hasNoEmptyGenre from "./steps/hasNoEmptyGenre";
import toReducedBands from "./steps/toReducedBand";
import countRejections from "./steps/countRejections";
import toString from "./steps/toString";

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
  .pipe(rMap(toString));

rxToStream(obs).pipe(process.stdout);
