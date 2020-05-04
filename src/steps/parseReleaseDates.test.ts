import parseReleaseDates from "./parseReleaseDates";
import { MetalArchivesEntry } from "../types/Band";
import { factory } from "factoree";

const createMetalArchiveEntry = factory<MetalArchivesEntry>({
  "First release": undefined,
  "Latest release": undefined
});

describe("parseReleaseDates", () => {
  it("should parse the release dates and turn them numbers", () => {
    const maEntry = createMetalArchiveEntry({
      "First release": "1999",
      "Latest release": "2017"
    });
    const result = parseReleaseDates(maEntry);
    expect<number>(result.firstRelease).toEqual(1999);
    expect<number>(result.latestRelease).toEqual(2017);
    expect<MetalArchivesEntry>(result.maEntry).toEqual(maEntry);
  });

  it("should parse the release dates and turn them to NaN if they are not existing", () => {
    const maEntry = createMetalArchiveEntry({});
    const result = parseReleaseDates(maEntry);
    expect<number>(result.firstRelease).toEqual(NaN);
    expect<number>(result.latestRelease).toEqual(NaN);
    expect<MetalArchivesEntry>(result.maEntry).toEqual(maEntry);
  });

  it("should parse the release dates and turn them into either NaN or a number", () => {
    const maEntry = createMetalArchiveEntry({ "First release": "1994" });
    const result = parseReleaseDates(maEntry);
    expect<number>(result.firstRelease).toEqual(1994);
    expect<number>(result.latestRelease).toEqual(NaN);
    expect<MetalArchivesEntry>(result.maEntry).toEqual(maEntry);
  });
});
