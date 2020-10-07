import _ from "lodash";
import * as sdk from "src/bitfan";

import { areSame, isOOS } from "../../services/labels";

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

export const mostConfidentBinaryScore: typeof sdk.metrics.mostConfidentBinaryScore = {
  name: "mostConfidentBinaryScore",
  eval: <T extends sdk.SingleLabel>(res: sdk.Result<T>): number => {
    const { prediction, label } = res;
    const elected = electMostConfident(prediction);
    return areSame<sdk.SingleLabel>(label, elected) ? 1 : 0;
  },
};

export const oosBinaryScore: typeof sdk.metrics.oosBinaryScore = {
  name: "oosBinaryScore",
  eval: <T extends sdk.SingleLabel>(res: sdk.Result<T>): number => {
    const { prediction, label } = res;
    const elected = electMostConfident(prediction);

    const expectedIsOOS = isOOS<sdk.SingleLabel>(label);
    const actualIsOOS = isOOS<sdk.SingleLabel>(elected);
    const testPass =
      (expectedIsOOS && actualIsOOS) || (!expectedIsOOS && !actualIsOOS);

    return testPass ? 1 : 0;
  },
};
