import _ from "lodash";
import * as sdk from "src/bitfan";

const _getMaxConfidence = (
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

export const binaryIntentScore: sdk.Metric<"intent"> = {
  name: "binaryIntentScore",
  eval: (res: sdk.Result<"intent">): number => {
    const { text, prediction, label } = res;
    const elected = _getMaxConfidence(prediction, label.length);
    return _.isEqual(label.sort(), elected.sort()) ? 1 : 0;
  },
};

function isIntentResult(
  res: sdk.Result<"intent"> | sdk.Result<"intent-oos">
): res is sdk.Result<"intent"> {
  return res.label.length !== 1 || res.label[0] !== "oo-scope";
}

export const binaryIntentOOSScore: sdk.Metric<"intent-oos"> = {
  name: "binaryIntentOOSScore",
  eval: (res: sdk.Result<"intent-oos">): number => {
    if (isIntentResult(res)) {
      return binaryIntentScore.eval(res);
    }

    const elected = _getMaxConfidence(res.prediction, 1);
    return elected[0] === "oo-scope" ? 1 : 0;
  },
};
