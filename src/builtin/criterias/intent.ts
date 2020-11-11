import _ from "lodash";
import * as sdk from "src/bitfan";

import { areSame, isOOS, OOS, splitIntentTopic } from "../../builtin/labels";

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
  dict: _.Dictionary<number>,
  opt?: Partial<{ ignoreOOS: boolean }>
): sdk.Label<sdk.SingleLabel> => {
  const defaultOpt = { ignoreOOS: false };
  const options = { ...defaultOpt, ...opt };

  if (options.ignoreOOS) {
    return _electMostConfidents(_.omit(dict, OOS), 1)[0];
  }
  return _electMostConfidents(dict, 1)[0];
};

export const labelIs: typeof sdk.criterias.labelIs = {
  name: "labelIs",
  eval: <T extends sdk.SingleLabel>(res: sdk.PredictOutput<T>): number => {
    const { prediction, label } = res;
    const elected = electMostConfident(prediction);
    return areSame<sdk.SingleLabel>(label, elected) ? 1 : 0;
  },
};

export const labelHasTopic: typeof sdk.criterias.labelHasTopic = {
  name: "labelHasTopic",
  eval: (res: sdk.PredictOutput<"intent-topic">): number => {
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
