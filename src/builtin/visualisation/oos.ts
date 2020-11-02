import * as sdk from "bitfan/sdk";
import chalk from "chalk";
import _ from "lodash";
import { oosConfusion, oosPerformance } from "../metrics/oos";

export const showOOSConfusion: typeof sdk.visualisation.showOOSConfusion = async (
  results: sdk.Result<sdk.SingleLabel>[]
) => {
  const { truePos, falsePos, falseNeg, trueNeg } = await oosConfusion(results);

  const confusionMatrix = {
    electedIsOOScope: {
      actualIsOOScope: truePos,
      actualIsInScope: falsePos,
    },
    electedIsInScope: {
      actualIsOOScope: falseNeg,
      actualIsInScope: trueNeg,
    },
  };

  console.log(chalk.green("OOS Confusion Matrix: "));
  console.table(confusionMatrix);
};

export const showOOSPerformance: typeof sdk.visualisation.showOOSPerformance = async (
  results: sdk.Result<sdk.SingleLabel>[],
  options?: Partial<sdk.AggregateOptions>
) => {
  const performance = await oosPerformance(results, options);
  console.log(chalk.green("OOS Performance metrics: "));
  console.table(performance);
};
