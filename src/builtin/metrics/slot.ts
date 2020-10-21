import * as sdk from "bitfan/sdk";
import _ from "lodash";

export const slotBinaryScore: typeof sdk.metrics.slotBinaryScore = {
  name: "slotBinaryScore",
  eval: (res: sdk.PredictOutput<"slot">): number => {
    return slotScore.eval(res) === 1 && slotCount.eval(res) === 1 ? 1 : 0;
  },
};

export const slotScore: typeof sdk.metrics.slotScore = {
  name: "slotScore",
  eval: (res: sdk.PredictOutput<"slot">): number => {
    if (!res.label.length) {
      return 1;
    }

    let score = 0;
    for (const slot of res.label) {
      const pred = res.prediction[slot.name];
      if (pred) {
        score += pred.start === slot.start && pred.end === slot.end ? 1 : 0;
      }
    }
    return score / res.label.length;
  },
};

export const slotCount: typeof sdk.metrics.slotCount = {
  name: "slotCount",
  eval: (res: sdk.PredictOutput<"slot">): number => {
    const success = res.label.length === Object.keys(res.prediction).length;
    return success ? 1 : 0;
  },
};
