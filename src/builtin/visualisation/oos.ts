import * as sdk from "bitfan/sdk";
import chalk from "chalk";
import _ from "lodash";
import { roundNumbers2Level } from "../../services/logging";
import { oosConfusion, oosPerformance } from "../metrics/oos";

export const showOOSConfusion: typeof sdk.visualisation.showOOSConfusion = async (
  results: sdk.Result<sdk.SingleLabel>[]
) => {
  const res = await oosConfusion(results, { groupBy: "all" });
  const { truePos, falsePos, falseNeg, trueNeg } = res["all"];

  const confusionMatrix = {
    "elected is oo-scope": {
      "actual is oo-scope": truePos,
      "actual is in-scope": falsePos,
    },
    "elected is in-scope": {
      "actual is oo-scope": falseNeg,
      "actual is in-scope": trueNeg,
    },
  };

  console.log(chalk.green("OOS Confusion Matrix: "));
  console.table(roundNumbers2Level(confusionMatrix, 4));
};

export const showOOSPerformance: typeof sdk.visualisation.showOOSPerformance = async (
  results: sdk.Result<sdk.SingleLabel>[],
  options?: Partial<sdk.AggregateOptions>
) => {
  const table = await oosPerformance(results, options);

  const performance = _.mapValues(
    table,
    ({ accuracy, precision, recall, f1 }) => {
      return {
        "oos accuracy": accuracy,
        "oos precision": precision,
        "oos recall": recall,
        "oos f1": f1,
      };
    }
  );

  console.log(chalk.green("OOS Performance metrics: "));
  console.table(roundNumbers2Level(performance));
};
