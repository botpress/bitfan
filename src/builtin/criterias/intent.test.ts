import * as sdk from "../../bitfan";
import { labelHasTopic, labelIs } from "./intent";

test("test binary intent scoring", () => {
  const prediction: sdk.Understanding<"intent"> = {
    C: 0,
    A: 1,
    B: 0,
  };

  const result: sdk.PredictOutput<"intent"> = {
    text: "some nice utterance",
    prediction,
    label: "A",
  };

  const score = labelIs.eval(result);

  expect(score).toBe(1);
});

test("test binary intent scoring with oos", () => {
  const prediction: sdk.Understanding<"intent"> = {
    A: 0.7,
    B: 0.8,
    C: 0,
    oos: 0.99,
  };

  const result: sdk.PredictOutput<"intent"> = {
    text: "some nice utterance",
    prediction,
    label: "oos",
  };

  const score = labelIs.eval(result);

  expect(score).toBe(1);
});

test("test binary topic scoring with correct prediction", () => {
  const prediction: sdk.Understanding<"intent-topic"> = {
    "topicA/intentA": 0.2,
    "topicA/intentB": 0.25,
    "topicB/intentA": 0.3,
  };

  const result: sdk.PredictOutput<"intent-topic"> = {
    text: "some nice utterance",
    prediction,
    label: "topicB/intentF",
  };

  const score = labelHasTopic.eval(result);

  expect(score).toBe(1);
});

test("test binary topic scoring with incorrect prediction", () => {
  const prediction: sdk.Understanding<"intent-topic"> = {
    "topicA/intentA": 0.2,
    "topicA/intentB": 0.25,
    "topicB/intentA": 0.3,
  };

  const result: sdk.PredictOutput<"intent-topic"> = {
    text: "some nice utterance",
    prediction,
    label: "topicA/intentF",
  };

  const score = labelHasTopic.eval(result);

  expect(score).toBe(0);
});

test("test binary topic scoring with oos", () => {
  const prediction: sdk.Understanding<"intent-topic"> = {
    "topicA/intentA": 0.2,
    oos: 0.9,
  };

  const result: sdk.PredictOutput<"intent-topic"> = {
    text: "some nice utterance",
    prediction,
    label: "oos",
  };

  const score = labelHasTopic.eval(result);

  expect(score).toBe(1);
});
