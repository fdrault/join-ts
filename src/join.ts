type Factory<T, U> = (deps: T) => U;

type Dependencies<T> = { [key: string]: T };

type Merge<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

export interface JoinConfiguration {
  eagerlyInit: boolean;
  log: boolean;
}

export interface JoinInstance<T extends Dependencies<any> = {}> {
  bind<F extends string, U extends Record<F, Factory<T, any>>>(
    factory: U
  ): JoinInstance<Merge<T & { [Key in keyof U]: ReturnType<U[Key]> }>>;
  includes<V extends Dependencies<any>>(
    container: JoinInstance<V>
  ): JoinInstance<Merge<T & V>>;
  inject(): T;
}
export class Join<T extends Dependencies<any> = {}> implements JoinInstance<T> {
  readonly _getters: T = {} as T;
  readonly _dependencies = new Map<string, any>();

  private constructor(private configuration: JoinConfiguration) {}

  bind<F extends string, U extends Record<F, Factory<T, any>>>(factories: U) {
    type NewDependencies = { [Key in keyof U]: ReturnType<U[Key]> };
    Object.entries(factories).forEach(([key, f]) => {
      Object.defineProperty(this._getters, key, {
        get: () => {
          if (this._dependencies.has(key)) {
            return this._dependencies.get(key);
          } else {
            this.log(`Creation of ${key} object`);
            const s = (f as Factory<T, any>)(this._getters);
            this._dependencies.set(key, s);
            return s;
          }
        },
        configurable: true,
        enumerable: true,
      });
      if (this.configuration.eagerlyInit) {
        this._getters[key];
      }
    });

    return this as unknown as JoinInstance<Merge<T & NewDependencies>>;
  }

  includes<V extends Dependencies<any>>(...modules: JoinInstance<V>[]) {
    for (const module of modules) {
      if (module instanceof Join) {
        Object.assign(this._getters, module._getters);
        mergeMaps(this._dependencies, module._dependencies);
      }
    }
    return this as unknown as JoinInstance<Merge<T & V>>;
  }

  inject(): T {
    return this._getters;
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

  private log(message: string) {
    if (this.configuration.log) {
      console.log(message);
    }
  }
}

function mergeMaps<K, V>(target: Map<K, V>, ...iterables: Map<K, V>[]) {
  for (const iterable of iterables) {
    for (const item of iterable) {
      target.set(...item);
    }
  }
}
