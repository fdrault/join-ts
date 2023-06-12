export type Factory<T, U> = (deps: T) => U;

export type Dependencies<T> = { [key: string]: T };

export type Merge<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

export interface JoinConfiguration {
  eagerlyInit: boolean;
  log: boolean;
}
