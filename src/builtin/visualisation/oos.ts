import * as sdk from "bitfan/sdk";
import chalk from "chalk";

import { electMostConfident } from "../metrics/intent";

export const showOOSConfusion = async <T extends "intent" | "topic">(
  results: sdk.Result<T>[],
  metrics: {
    [name: string]: number;
  }
) => {
  const oosResults = results.map((r) => {
    const elected = electMostConfident(r.prediction, r.label.length);
    const expected = r.label;

    return {
      electedIsOOS: elected.length === 1 && elected[0] === "oos",
      expectedIsOOS: expected.length === 1 && expected[0] === "oos",
    };
  });

  const truePos = oosResults.filter((r) => r.electedIsOOS && r.expectedIsOOS);
  const falsePos = oosResults.filter((r) => r.electedIsOOS && !r.expectedIsOOS);
  const trueNeg = oosResults.filter((r) => !r.electedIsOOS && !r.expectedIsOOS);
  const falseNeg = oosResults.filter((r) => !r.electedIsOOS && r.expectedIsOOS);

  const accuracy = (truePos.length + trueNeg.length) / results.length;
  const precision = truePos.length / (truePos.length + falsePos.length);
  const recall = truePos.length / (truePos.length + falseNeg.length);

  console.log(chalk.green("OOS Accuracy, Precision and Recall"));
  console.table({ accuracy, precision, recall });

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

  console.log(chalk.green("OOS ConfusionMatrix: "));
  console.table(confusionMatrix);
};
