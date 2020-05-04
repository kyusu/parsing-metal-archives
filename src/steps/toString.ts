import { Overview } from "../types/Overview";

const toString = (overview: Overview): string =>
  JSON.stringify(overview, null, 4);

export default toString;
