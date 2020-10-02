import * as sdk from "bitfan/sdk";
import chalk from "chalk";
import { isOOS } from "../../services/labels";

import { electMostConfident } from "../metrics/intent";

export const showOOSConfusion: typeof sdk.visualisation.showOOSConfusion = async <
  T extends sdk.IntentOrTopic
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
