import _ from "lodash";
import * as sdk from "src/bitfan";

import { areSame, isOOS } from "../../services/labels";

const _electMostConfidents = (
  dict: _.Dictionary<number>,
  electedCount: number
): string[] => {
  return _(dict)
    .toPairs()
    .orderBy((p) => p[1], "desc")
    .take(electedCount)
    .map((p) => p[0])
    .value();
};

export const electMostConfident = (
  dict: _.Dictionary<number>
): sdk.Label<sdk.IntentOrTopic> => {
  return _electMostConfidents(dict, 1)[0];
};

export const mostConfidentBinaryScore: sdk.Metric<sdk.IntentOrTopic> = {
  name: "mostConfidentBinaryScore",
  eval: <T extends sdk.IntentOrTopic>(res: sdk.Result<T>): number => {
    const { prediction, label } = res;
    const elected = electMostConfident(prediction);
    return areSame<sdk.IntentOrTopic>(label, elected) ? 1 : 0;
  },
};

export const oosBinaryScore: sdk.Metric<sdk.IntentOrTopic> = {
  name: "oosBinaryScore",
  eval: <T extends sdk.IntentOrTopic>(res: sdk.Result<T>): number => {
    const { prediction, label } = res;
    const elected = electMostConfident(prediction);

    const expectedIsOOS = isOOS<sdk.IntentOrTopic>(label);
    const actualIsOOS = isOOS<sdk.IntentOrTopic>(elected);
    const testPass =
      (expectedIsOOS && actualIsOOS) || (!expectedIsOOS && !actualIsOOS);

    return testPass ? 1 : 0;
  },
};
