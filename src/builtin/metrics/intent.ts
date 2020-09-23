import _ from "lodash";
import * as sdk from "bitfan/sdk";

export function binaryIntentScore(
  text: string,
  prediction: sdk.IntentPrediction,
  label: string[]
) {
  const elected = _(prediction).orderBy(_.identity).take(label.length).value();
  return _.isEqual(label.sort(), elected.sort()) ? 1 : 0;
}
