import * as sdk from "bitfan/sdk";
import { binaryIntentScore } from "./intent";

test("test binary intent scoring", () => {
  const prediction = {
    A: 1,
    B: 0,
    C: 0,
  };

  const result: sdk.Result<"intent"> = {
    text: "some nice utterance",
    prediction,
    label: ["A"],
  };

  const score = binaryIntentScore.eval(result);

  expect(score).toBe(1);
});

test("test binary intent scoring with two intents", () => {
  const prediction = {
    A: 0.9,
    B: 0.8,
    C: 0,
  };

  const result: sdk.Result<"intent"> = {
    text: "some nice utterance",
    prediction,
    label: ["A", "B"],
  };

  const score = binaryIntentScore.eval(result);

  expect(score).toBe(1);
});
