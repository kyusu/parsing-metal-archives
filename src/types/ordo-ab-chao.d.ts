/// <reference types="node" />

declare module "ordo-ab-chao" {
  export type IsMetal = {
    isMetal: {
      runWith: (input: string) => boolean;
    };
  };

  export const isMetal: IsMetal;

  const runWith = { runWith: (input: string) => boolean };

  export const isBlackMetal = runWith;
  export const isDeathMetal = runWith;
  export const isDoomMetal = runWith;
  export const isHeavyMetal = runWith;
  export const isPowerMetal = runWith;
  export const isSpeedMetal = runWith;
  export const isThrashMetal = runWith;
}
