/// <reference types="node" />

type StringPredicate = (input: string) => boolean;

declare module "ordo-ab-chao" {
  export type IsMetal = {
    isMetal: {
      runWith: StringPredicate;
    };
  };

  export const isMetal: IsMetal;

  const runWith = { runWith: StringPredicate };

  export const isBlackMetal = runWith;
  export const isDeathMetal = runWith;
  export const isDoomMetal = runWith;
  export const isHeavyMetal = runWith;
  export const isPowerMetal = runWith;
  export const isSpeedMetal = runWith;
  export const isThrashMetal = runWith;
}
