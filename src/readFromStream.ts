import { streamToRx } from "rxjs-stream";
import { createReadStream, PathLike } from "fs";
import parse from "csv-parse";
import { Observable } from "rxjs";
import { MetalArchivesEntry } from "./types/Band";

export type GetBandStream = (
  filePath: PathLike
) => Observable<MetalArchivesEntry>;

const parser: parse.Parser = parse({
  delimiter: ",",
  columns: true
});

const getBandStream: GetBandStream = (filePath: PathLike) =>
  streamToRx<MetalArchivesEntry>(
    createReadStream(filePath, {
      encoding: "utf-8"
    }).pipe(parser)
  );

export default getBandStream;
