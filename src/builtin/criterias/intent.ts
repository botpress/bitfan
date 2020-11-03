import _ from "lodash";
import * as sdk from "src/bitfan";

import { areSame, isOOS, splitIntentTopic } from "../../builtin/labels";

const _electMostConfidents = (
  dict: _.Dictionary<number>,
  electedCount: number
): sdk.Label<sdk.MultiLabel> => {
  return _(dict)
    .toPairs()
    .orderBy((p) => p[1], "desc")
    .take(electedCount)
    .map((p) => p[0])
    .value();
};

export const electMostConfident = (
  dict: _.Dictionary<number>
): sdk.Label<sdk.SingleLabel> => {
  return _electMostConfidents(dict, 1)[0];
};

export const labelIs: typeof sdk.criterias.labelIs = {
  name: "labelIs",
  eval: <T extends sdk.SingleLabel>(res: sdk.Result<T>): number => {
    const { prediction, label } = res;
    const elected = electMostConfident(prediction);
    return areSame<sdk.SingleLabel>(label, elected) ? 1 : 0;
  },
};

export const labelHasTopic: typeof sdk.criterias.labelHasTopic = {
  name: "labelHasTopic",
  eval: (res: sdk.Result<"intent-topic">): number => {
    const { prediction, label } = res;
    const elected = electMostConfident(prediction);

    if (isOOS(elected) && isOOS(label)) {
      return 1;
    } else if (isOOS(elected) || isOOS(label)) {
      return 0;
    }

    const { topic: topicLabel } = splitIntentTopic(label);
    const { topic: topicElected } = splitIntentTopic(elected);
    return topicLabel === topicElected ? 1 : 0;
  },
};
