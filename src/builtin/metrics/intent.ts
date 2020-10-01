import _ from "lodash";
import * as sdk from "src/bitfan";

import { areSame, isOOS } from "../../services/labels";

export type IntentOrTopic = "intent" | "topic";

const _electMostConfidents = <T extends IntentOrTopic>(
  dict: _.Dictionary<number>,
  electedCount: number
): sdk.Label<T>[] => {
  return _(dict)
    .toPairs()
    .orderBy((p) => p[1], "desc")
    .take(electedCount)
    .map((p) => p[0])
    .value() as sdk.Label<T>[];
};

export const electMostConfident = <T extends IntentOrTopic>(
  dict: _.Dictionary<number>
): sdk.Label<T> => {
  return _electMostConfidents(dict, 1)[0] as sdk.Label<T>;
};

export const mostConfidentBinaryScore: sdk.Metric<IntentOrTopic> = {
  name: "mostConfidentBinaryScore",
  eval: <T extends IntentOrTopic>(res: sdk.Result<T>): number => {
    const { text, prediction, label } = res;
    const elected = electMostConfident(prediction);
    return areSame<IntentOrTopic>(label, elected) ? 1 : 0;
  },
};

export const oosBinaryScore: sdk.Metric<IntentOrTopic> = {
  name: "oosBinaryScore",
  eval: <T extends IntentOrTopic>(res: sdk.Result<T>): number => {
    const { text, prediction, label } = res;
    const elected = electMostConfident(prediction);

    const expectedIsOOS = isOOS<IntentOrTopic>(label);
    const actualIsOOS = isOOS<IntentOrTopic>(elected);
    const testPass =
      (expectedIsOOS && actualIsOOS) || (!expectedIsOOS && !actualIsOOS);

    return testPass ? 1 : 0;
  },
};
