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

export const binaryIntentScore: sdk.Metric<"intent"> &
  sdk.Metric<"intent-oos"> = {
  name: "binaryIntentScore",
  eval: (res: sdk.Result<"intent"> | sdk.Result<"intent-oos">): number => {
    const { text, prediction, label } = res;
    const elected = _getMaxConfidence(prediction, label.length);
    return _.isEqual(label.sort(), elected.sort()) ? 1 : 0;
  },
};
