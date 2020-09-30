import * as sdk from "bitfan/sdk";
import { binaryIntentScore } from "./intent";

test("test binary intent scoring", () => {
  const prediction = {
    C: 0,
    A: 1,
    B: 0,
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
    C: 0,
    A: 0.9,
    B: 0.8,
  };

  const result: sdk.Result<"intent"> = {
    text: "some nice utterance",
    prediction,
    label: ["A", "B"],
  };

  const score = binaryIntentScore.eval(result);

  expect(score).toBe(1);
});

test("test binary intent scoring with oos", () => {
  const prediction: sdk.Prediction<"intent"> = {
    A: 0.7,
    B: 0.8,
    C: 0,
    oos: 0.99,
  };

  const result: sdk.Result<"intent"> = {
    text: "some nice utterance",
    prediction,
    label: ["oos"],
  };

  const score = binaryIntentScore.eval(result);

  expect(score).toBe(1);
});
