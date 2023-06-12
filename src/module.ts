import { Resolver } from "./resolver";
import { Dependencies, Factory, JoinConfiguration, Merge } from "./types";

// export interface JoinModule<
//   Public extends Dependencies<any> = {},
//   Internal extends Dependencies<any> = {},
//   Private extends Dependencies<any> = {}
// > {
//   public<
//     DependencyName extends string,
//     U extends Record<
//       DependencyName,
//       Factory<Merge<Public & Internal & Private>, any>
//     >
//   >(
//     factories: U
//   ): JoinModule<
//     Merge<Public & { [Key in keyof U]: ReturnType<U[Key]> }>,
//     Internal,
//     Private
//   >;

//   internal<
//     DependencyName extends string,
//     U extends Record<DependencyName, Factory<Public, any>>
//   >(
//     factories: U
//   ): JoinModule<
//     Public,
//     Merge<Internal & { [Key in keyof U]: ReturnType<U[Key]> }>,
//     Private
//   >;

//   private<
//     DependencyName extends string,
//     U extends Record<DependencyName, Factory<Public, any>>
//   >(
//     factories: U
//   ): JoinModule<
//     Public,
//     Internal,
//     Merge<Private & { [Key in keyof U]: ReturnType<U[Key]> }>
//   >;

//   modules<
//     MPublic extends Dependencies<any>,
//     MInternal extends Dependencies<any>,
//     MPrivate extends Dependencies<any>
//   >(
//     ...modules: JoinModule<MPublic, MInternal, MPrivate>[]
//   ): JoinModule<
//     Merge<Public & { [Key in keyof MPublic]: ReturnType<MPublic[Key]> }>,
//     Merge<Internal & { [Key in keyof MInternal]: ReturnType<MInternal[Key]> }>,
//     Private
//   >;
// }
type MergeVariadic<T extends JoinModuleInternal<any, any, any>[]> = T extends [
  infer First,
  infer Second,
  ...infer Rest
]
  ? First extends JoinModuleInternal<
      infer Public,
      infer Internal,
      infer Private
    >
    ? Second extends JoinModuleInternal<
        infer PublicSecond,
        infer InternalSecond,
        any
      >
      ? Rest extends JoinModuleInternal<any, any, any>[]
        ? MergeVariadic<
            [
              JoinModuleInternal<
                Merge<Public & PublicSecond>,
                Merge<Internal & InternalSecond>,
                Private
              >,
              ...Rest
            ]
          >
        : JoinModuleInternal<
            Merge<Public & PublicSecond>,
            Merge<Internal & InternalSecond>,
            Private
          >
      : T
    : T
  : T;

export class JoinModuleInternal<
  Public extends Dependencies<any> = {},
  Internal extends Dependencies<any> = {},
  Private extends Dependencies<any> = {}
> {
  publicResolver = Resolver.init();
  internalResolver = Resolver.init();
  privateResolver = Resolver.init();

  constructor(private configuration: JoinConfiguration) {}
  public<
    DependencyName extends string,
    Factories extends Record<
      DependencyName,
      Factory<Merge<Public & Internal & Private>, any>
    >
  >(factories: Factories) {
    type NewPublic = { [Key in keyof Factories]: ReturnType<Factories[Key]> };
    this.publicResolver.register(factories);
    return this as JoinModuleInternal<
      Merge<Public & NewPublic>,
      Internal,
      Private
    >;
  }

  internal<
    DependencyName extends string,
    U extends Record<
      DependencyName,
      Factory<Merge<Public & Internal & Private>, any>
    >
  >(factories: U) {
    type NewInternal = { [Key in keyof U]: ReturnType<U[Key]> };
    this.internalResolver.register(factories);
    return this as JoinModuleInternal<
      Public,
      Merge<Internal & NewInternal>,
      Private
    >;
  }

  private<
    DependencyName extends string,
    U extends Record<
      DependencyName,
      Factory<Merge<Public & Internal & Private>, any>
    >
  >(factories: U) {
    type NewPrivate = { [Key in keyof U]: ReturnType<U[Key]> };
    this.privateResolver.register(factories);
    return this as JoinModuleInternal<
      Public,
      Internal,
      Merge<Private & NewPrivate>
    >;
  }

  modules<T extends JoinModuleInternal<any, any, any>[]>(
    ...modules: T
  ): MergeVariadic<T> {
    this.publicResolver = Resolver.merge(
      this.publicResolver,
      ...modules.map((m) => (m as JoinModuleInternal).publicResolver)
    );
    this.internalResolver = Resolver.merge(
      this.internalResolver,
      ...modules.map((m) => (m as JoinModuleInternal).internalResolver)
    );

    return this as MergeVariadic<T>;
  }
}
