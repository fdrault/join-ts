import { JoinModule, JoinModuleInternal } from "./module";

type Factory<T, U> = (deps: T) => U;

type Dependencies<T> = { [key: string]: T };

type Merge<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

export interface JoinConfiguration {
  eagerlyInit: boolean;
  log: boolean;
}

export interface JoinInstance<T extends Dependencies<any> = {}> {
  modules<V extends Dependencies<any>>(
    ...modules: JoinModule<V>[]
  ): JoinInstance<{
    [Key in keyof V]: ReturnType<V[Key]>;
  }>;
  inject(): T;
}
export class Join<T extends Dependencies<any> = {}> implements JoinInstance<T> {
  private constructor(private configuration: JoinConfiguration) {}
  private rootModule: JoinModule = new JoinModuleInternal({
    log: true,
    eagerlyInit: false,
  });

  modules<V extends Dependencies<any>>(...modules: JoinModule<V>[]) {
    this.rootModule = this.rootModule.modules(
      ...(modules as JoinModuleInternal<V>[])
    );
    return this as unknown as JoinInstance<{
      [Key in keyof V]: ReturnType<V[Key]>;
    }>;
  }

  inject(): T {
    return (this.rootModule as JoinModuleInternal<T>).publicResolver
      ._getters as T;
  }

  static init<T extends Dependencies<any> = {}>(
    configuration?: Partial<JoinConfiguration>
  ): JoinInstance<T> {
    const defaultConfiguration: JoinConfiguration = {
      eagerlyInit: false,
      log: false,
    };
    return new Join<T>({
      ...defaultConfiguration,
      ...configuration,
    }) as JoinInstance<T>;
  }
}
