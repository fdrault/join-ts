import { JoinModuleInternal } from "./module";
import { Dependencies, Merge } from "./types";

type MergePublic<T extends JoinModuleInternal<any, any, any>[]> = T extends [
  JoinModuleInternal<infer Public, any, any>,
  ...infer Rest
]
  ? Rest extends [
      JoinModuleInternal<infer PublicSecond, any, any>,
      ...infer RestSecond
    ]
    ? RestSecond extends JoinModuleInternal<any, any, any>[]
      ? MergePublic<
          [
            JoinModuleInternal<Merge<Public & PublicSecond>, any, any>,
            ...RestSecond
          ]
        >
      : Merge<Public & PublicSecond>
    : Public
  : never;

export interface JoinConfiguration {
  eagerlyInit: boolean;
  log: boolean;
}

export interface JoinInstance<T extends Dependencies<any> = {}> {
  modules<T extends JoinModuleInternal<any, any, any>[]>(
    ...modules: T
  ): JoinInstance<MergePublic<T>>;
  inject(): T;
}
export class Join<T extends Dependencies<any> = {}> implements JoinInstance<T> {
  private constructor(private configuration: JoinConfiguration) {}
  private rootModule = new JoinModuleInternal({
    log: true,
    eagerlyInit: false,
  });

  modules<T extends JoinModuleInternal<any, any, any>[]>(...modules: T) {
    this.rootModule = this.rootModule.modules(this.rootModule, ...modules);
    return this as unknown as JoinInstance<MergePublic<T>>;
  }

  inject(): T {
    console.log(JSON.stringify(this.rootModule.publicResolver._getters));
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
