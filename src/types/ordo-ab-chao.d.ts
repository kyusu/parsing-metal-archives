/// <reference types="node" />

declare module "ordo-ab-chao" {
  export type IsMetal = {
    isMetal: {
      runWith: (input: string) => boolean;
    };
  };

  export const isMetal: IsMetal;
}
