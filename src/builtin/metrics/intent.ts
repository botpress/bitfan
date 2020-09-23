import _ from "lodash";
import * as sdk from "src/bitfan";

export const binaryIntentScore: sdk.Metric<"intent"> = {
  name: "binaryIntentScore",
  eval: (res: sdk.Result<"intent">): number => {
    const { text, prediction, label } = res;
    const elected = _(prediction)
      .orderBy(_.identity)
      .take(label.length)
      .value();
    return _.isEqual(label.sort(), elected.sort()) ? 1 : 0;
  },
};
