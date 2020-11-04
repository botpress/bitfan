import * as sdk from "../../bitfan";
import { toTable } from "./report";

test("toTable", () => {
  // arrange
  const performanceReport: sdk.PerformanceReport = {
    generatedOn: new Date(),
    groupedBy: "seed",
    scores: [
      { metric: "avgScore", group: "42", score: 1 },
      { metric: "accuracy", group: "42", score: 2 },
      { metric: "avgScore", group: "69", score: 3 },
      { metric: "accuracy", group: "69", score: 4 },
    ],
  };

  // act
  const table = toTable(performanceReport);

  // assert
  expect(table["avgScore"]["42"]).toBe(1);
  expect(table["accuracy"]["42"]).toBe(2);
  expect(table["avgScore"]["69"]).toBe(3);
  expect(table["accuracy"]["69"]).toBe(4);
});
