import * as sdk from "bitfan/sdk";
import chalk from "chalk";
import { roundNumbers } from "../../services/logging";
import { isOOS } from "../../builtin/labels";

import { electMostConfident } from "../criterias/intent";

const DEFAULT_OPTIONS: sdk.Options = {
  aggregateBy: "all",
  silent: false,
};

export const showOOSConfusion: typeof sdk.metrics.showOOSConfusion = async <
  T extends sdk.SingleLabel
>(
  results: sdk.Result<T>[]
) => {
  const oosResults = results.map((r) => {
    const elected = electMostConfident(r.prediction);
    const expected = r.label;

    return {
      electedIsOOS: isOOS(elected),
      expectedIsOOS: isOOS(expected),
    };
  });

  const truePos = oosResults.filter((r) => r.electedIsOOS && r.expectedIsOOS);
  const falsePos = oosResults.filter((r) => r.electedIsOOS && !r.expectedIsOOS);
  const trueNeg = oosResults.filter((r) => !r.electedIsOOS && !r.expectedIsOOS);
  const falseNeg = oosResults.filter((r) => !r.electedIsOOS && r.expectedIsOOS);

  const confusionMatrix = {
    electedIsOOScope: {
      actualIsOOScope: truePos.length,
      actualIsInScope: falsePos.length,
    },
    electedIsInScope: {
      actualIsOOScope: falseNeg.length,
      actualIsInScope: trueNeg.length,
    },
  };

  console.log(chalk.green("OOS Confusion Matrix: "));
  console.table(confusionMatrix);
};

// TODO: extract common code
export const showOOSPerformance: typeof sdk.metrics.showOOSPerformance = async <
  T extends sdk.SingleLabel
>(
  results: sdk.Result<T>[],
  options?: Partial<sdk.Options>
) => {
  options = options ?? {};
  const resolvedOptions = { ...DEFAULT_OPTIONS, ...options };

  // TODO: aggregate by options

  const oosResults = results.map((r) => {
    const elected = electMostConfident(r.prediction);
    const expected = r.label;

    return {
      electedIsOOS: isOOS(elected),
      expectedIsOOS: isOOS(expected),
    };
  });

  const truePos = oosResults.filter((r) => r.electedIsOOS && r.expectedIsOOS);
  const falsePos = oosResults.filter((r) => r.electedIsOOS && !r.expectedIsOOS);
  const trueNeg = oosResults.filter((r) => !r.electedIsOOS && !r.expectedIsOOS);
  const falseNeg = oosResults.filter((r) => !r.electedIsOOS && r.expectedIsOOS);

  const accuracy = (truePos.length + trueNeg.length) / results.length;
  const precision = truePos.length / (truePos.length + falsePos.length);
  const recall = truePos.length / (truePos.length + falseNeg.length);
  const f1 = 2 * ((precision * recall) / (precision + recall));
  const performance = { accuracy, precision, recall, f1 };

  if (!resolvedOptions.silent) {
    console.log(chalk.green("OOS Accuracy, Precision and Recall"));
    console.table(roundNumbers(performance, 4));
  }

  return performance;
};
