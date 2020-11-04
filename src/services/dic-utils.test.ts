import { initDictionnary } from "./dic-utils";

test("initDictionnary", () => {
  // arrange

  // act
  const table = initDictionnary(["A", "B"], () => 69);

  // assert
  expect(table["A"]).toBe(69);
  expect(table["B"]).toBe(69);
});
