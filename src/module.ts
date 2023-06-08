import { Resolver } from "./resolver";
import { Dependencies, Factory, JoinConfiguration, Merge } from "./types";

export interface JoinModule<
  Public extends Dependencies<any> = {},
  Internal extends Dependencies<any> = {},
  Private extends Dependencies<any> = {}
> {
  public<
    DependencyName extends string,
    U extends Record<DependencyName, Factory<Public, any>>
  >(
    factories: U
  ): JoinModule<
    Merge<Public & { [Key in keyof U]: ReturnType<U[Key]> }>,
    Internal,
    Private
  >;

  internal<
    DependencyName extends string,
    U extends Record<DependencyName, Factory<Public, any>>
  >(
    factories: U
  ): JoinModule<
    Public,
    Merge<Internal & { [Key in keyof U]: ReturnType<U[Key]> }>,
    Private
  >;

  private<
    DependencyName extends string,
    U extends Record<DependencyName, Factory<Public, any>>
  >(
    factories: U
  ): JoinModule<
    Public,
    Internal,
    Merge<Private & { [Key in keyof U]: ReturnType<U[Key]> }>
  >;

  modules<
    MPublic extends Dependencies<any>,
    MInternal extends Dependencies<any>,
    MPrivate extends Dependencies<any>
  >(
    ...modules: JoinModule<MPublic, MInternal, MPrivate>[]
  ): JoinModule<Merge<Public & MPublic>, Merge<Internal & MInternal>, Private>;
}

export class JoinModuleInternal<
  Public extends Dependencies<any> = {},
  Internal extends Dependencies<any> = {},
  Private extends Dependencies<any> = {}
> implements JoinModule<Public, Internal, Private>
{
  publicResolver = Resolver.init();
  internalResolver = Resolver.init();
  privateResolver = Resolver.init();

  private constructor(private configuration: JoinConfiguration) {}
  public<
    DependencyName extends string,
    Factories extends Record<DependencyName, Factory<Public, any>>
  >(
    factories: Factories
  ): JoinModule<
    Merge<Public & { [Key in keyof Factories]: ReturnType<Factories[Key]> }>,
    Internal,
    Private
  > {
    type NewPublic = { [Key in keyof Factories]: ReturnType<Factories[Key]> };
    this.publicResolver.register(factories);
    return this as JoinModule<Merge<Public & NewPublic>, Internal, Private>;
  }

  internal<
    DependencyName extends string,
    U extends Record<DependencyName, Factory<Public, any>>
  >(
    factories: U
  ): JoinModule<
    Public,
    Merge<Internal & { [Key in keyof U]: ReturnType<U[Key]> }>,
    Private
  > {
    type NewInternal = { [Key in keyof U]: ReturnType<U[Key]> };
    this.internalResolver.register(factories);
    return this as JoinModule<Public, Merge<Internal & NewInternal>, Private>;
  }

  private<
    DependencyName extends string,
    U extends Record<DependencyName, Factory<Public, any>>
  >(
    factories: U
  ): JoinModule<
    Public,
    Internal,
    Merge<Private & { [Key in keyof U]: ReturnType<U[Key]> }>
  > {
    type NewPrivate = { [Key in keyof U]: ReturnType<U[Key]> };
    this.privateResolver.register(factories);
    return this as JoinModule<Public, Internal, Merge<Private & NewPrivate>>;
  }

  modules<
    MPublic extends Dependencies<any>,
    MInternal extends Dependencies<any>,
    MPrivate extends Dependencies<any>
  >(
    ...modules: JoinModule<MPublic, MInternal, MPrivate>[]
  ): JoinModule<Merge<Public & MPublic>, Merge<Internal & MInternal>, Private> {
    this.publicResolver = Resolver.merge(
      this.publicResolver,
      ...modules.map((m) => (m as JoinModuleInternal).publicResolver)
    );
    this.internalResolver = Resolver.merge(
      this.internalResolver,
      ...modules.map((m) => (m as JoinModuleInternal).internalResolver)
    );

    return this as JoinModule<
      Merge<Public & MPublic>,
      Merge<Internal & MInternal>,
      Private
    >;
  }
}
