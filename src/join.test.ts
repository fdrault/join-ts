import { Join } from "./join";
import { JoinModuleInternal } from "./module";
class CoffeeCup {
  constructor(private content: "empty" | "full") {}
  getContent() {
    return this.content;
  }
}

class Milk {
  constructor(private amount: number) {}
  getAmount() {
    return this.amount;
  }
}
class Barista {
  constructor(private coffeeCup: CoffeeCup, private milk: Milk) {}
  makeLatte() {
    if (this.coffeeCup.getContent() === "empty") {
      console.log("Oops! Looks like the coffee cup is empty.");
      return false;
    } else if (this.milk.getAmount() < 50) {
      console.log("Oops! Not enough milk for a latte.");
      return false;
    }
    console.log("Making a delicious latte... Enjoy!");
    return true;
  }
}

const buildModule = () =>
  new JoinModuleInternal({ log: true, eagerlyInit: false });
const cupModule = buildModule()
  .internal({
    fullCoffeeCup: () => new CoffeeCup("full"),
  })
  .private({ emptyCup: () => new CoffeeCup("empty") });

const milkModule = buildModule()
  .internal({
    milkBrick: () => new Milk(100),
  })
  .private({ emptyMilkBrick: () => new Milk(0) });

const warehouseModule = buildModule().modules(cupModule, milkModule);
//, bar)

const coffeeShopModule = warehouseModule.public({
  barista: ({ fullCoffeeCup, milkBrick }) =>
    new Barista(fullCoffeeCup, milkBrick),
});

const initializeJoin = () => {
  return Join.init({ log: true }).modules(coffeeShopModule);
};

describe("Check ts-jest", () => {
  let joinInstance: ReturnType<typeof initializeJoin>;

  beforeAll(() => {
    joinInstance = initializeJoin();
  });

  test("Barista instantiate his dependencies automatically", () => {
    const { barista } = joinInstance.inject();
    expect(barista.makeLatte()).toBe(true);
  });
});
