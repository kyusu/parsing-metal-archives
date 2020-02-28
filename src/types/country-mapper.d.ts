/// <reference types="node" />

declare module "country-mapper" {
  export function convert(countryName: string): string | null;
  export function iso(countryName: string): string | null;
}
