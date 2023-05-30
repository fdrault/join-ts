import { Join } from "./join";
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

const initializeJoin = () =>
  Join.init({ log: true })
    .bind({
      fullCoffeeCup: () => new CoffeeCup("full"),
      milkBrick: () => new Milk(100),
    })
    .bind({
      barista: ({ fullCoffeeCup, milkBrick }) =>
        new Barista(fullCoffeeCup, milkBrick),
    });
describe("Check ts-jest", () => {
  let joinInstance: ReturnType<typeof initializeJoin>;

  beforeAll(() => {
    joinInstance = initializeJoin();
  });

  test("fullCoffeeCup is correctly instantiate", () => {
    const { fullCoffeeCup } = joinInstance.inject();
    expect(fullCoffeeCup.getContent() === "full").toBe(true);
  });

  test("Barista instantiate his dependencies automatically", () => {
    const { barista } = joinInstance.inject();
    expect(barista.makeLatte()).toBe(true);
  });
});
