import _ from "lodash";
import * as sdk from "src/bitfan";

export const electMostConfident = (
  dict: _.Dictionary<number>,
  electedCount: number
) => {
  return _(dict)
    .toPairs()
    .orderBy((p) => p[1], "desc")
    .take(electedCount)
    .map((p) => p[0])
    .value();
};

export const mostConfidentBinaryScore: sdk.Metric<"intent" | "topic"> = {
  name: "mostConfidentBinaryScore",
  eval: <T extends "intent" | "topic">(res: sdk.Result<T>): number => {
    const { text, prediction, label } = res;
    const elected = electMostConfident(prediction, label.length);
    return _.isEqual(label.sort(), elected.sort()) ? 1 : 0;
  },
};

export const oosBinaryScore: sdk.Metric<"intent" | "topic"> = {
  name: "oosBinaryScore",
  eval: <T extends "intent" | "topic">(res: sdk.Result<T>): number => {
    const { text, prediction, label } = res;
    const elected = electMostConfident(prediction, label.length);

    const oosLabel = "oos";
    const expectedIsOOS = label.length === 1 && label[0] === oosLabel;
    const actualIsOOS = elected.length === 1 && elected[0] === oosLabel;
    const testPass =
      (expectedIsOOS && actualIsOOS) || (!expectedIsOOS && !actualIsOOS);

    return testPass ? 1 : 0;
  },
};
