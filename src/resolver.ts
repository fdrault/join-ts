import { Factory, JoinConfiguration } from "./types";
import { mergeMaps } from "./utils";

export class Resolver {
  readonly _getters: {};
  readonly _dependencies: Map<string, any>;

  private constructor(
    private configuration: JoinConfiguration,
    getters: any,
    dependencies: Map<string, any>
  ) {
    this._getters = getters;
    this._dependencies = dependencies;
  }

  has(key: string) {
    return key in this._getters;
  }

  resolve(key: string) {
    return this._getters[key];
  }

  register(factories: Record<string, Factory<any, any>>) {
    Object.entries(factories).forEach(([key, f]) => {
      Object.defineProperty(this._getters, key, {
        get: () => {
          if (this._dependencies.has(key)) {
            return this._dependencies.get(key);
          } else {
            console.log(`Creation of ${key} object`);
            const s = (f as Factory<any, any>)(this._getters);
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
  }

  static init(): Resolver {
    return new Resolver(
      { log: true, eagerlyInit: false },
      {},
      new Map<string, any>()
    );
  }

  static merge(...resolvers: Resolver[]): Resolver {
    const mergedGetters = {};
    const mergedDependencies = new Map<string, any>();
    for (const resolver of resolvers) {
      Object.assign(mergedGetters, resolver._getters);
      mergeMaps(mergedDependencies, resolver._dependencies);
    }
    return new Resolver(
      { log: true, eagerlyInit: false },
      mergedGetters,
      mergedDependencies
    );
  }
}
