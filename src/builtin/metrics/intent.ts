import _ from "lodash";
import * as sdk from "bitfan/sdk";

export const binaryIntentScore: sdk.ScoreFunction<"intent"> = (
  text: string,
  prediction: sdk.Prediction<"intent">,
  label: string[]
): number => {
  const elected = _(prediction).orderBy(_.identity).take(label.length).value();
  return _.isEqual(label.sort(), elected.sort()) ? 1 : 0;
};
