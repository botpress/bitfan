import * as sdk from "bitfan/sdk";
import { isOOS } from "../../builtin/labels";

import { electMostConfident } from "../criterias/intent";
import _ from "lodash";

export const inScopeAccuracy: typeof sdk.metrics.inScopeAccuracy = {
  name: "inScopeAccuracy",
  eval: (results: sdk.PredictOutput<sdk.SingleLabel>[]) => {
    const inScopeSamples = results.filter((r) => !isOOS(r.label));

    const totalScore = inScopeSamples.reduce((totalScore, currentSample) => {
      const elected = electMostConfident(currentSample.prediction, {
        ignoreOOS: true,
      });
      const currentScore = elected === currentSample.label ? 1 : 0;
      return totalScore + currentScore;
    }, 0);

    return totalScore / inScopeSamples.length;
  },
};
