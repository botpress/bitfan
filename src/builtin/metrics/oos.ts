import * as sdk from "bitfan/sdk";
import chalk from "chalk";
import { roundNumbers2Level } from "../../services/logging";
import { isOOS } from "../../builtin/labels";

import { electMostConfident } from "../criterias/intent";
import _ from "lodash";

const DEFAULT_OPTIONS: sdk.ViewOptions = {
  aggregateBy: "all",
  silent: false,
};

type ConfusionMatrix = {
  truePos: number;
  falsePos: number;
  trueNeg: number;
  falseNeg: number;
};

type OOSPerformance = {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
};

const _oosConfusion = (
  results: sdk.Result<sdk.SingleLabel>[],
  options: sdk.ViewOptions
): ConfusionMatrix => {
  const oosResults = results.map((r) => {
    const elected = electMostConfident(r.prediction);
    const expected = r.label;

    return {
      electedIsOOS: isOOS(elected),
      expectedIsOOS: isOOS(expected),
    };
  });

  const truePos = oosResults.filter((r) => r.electedIsOOS && r.expectedIsOOS)
    .length;
  const falsePos = oosResults.filter((r) => r.electedIsOOS && !r.expectedIsOOS)
    .length;
  const trueNeg = oosResults.filter((r) => !r.electedIsOOS && !r.expectedIsOOS)
    .length;
  const falseNeg = oosResults.filter((r) => !r.electedIsOOS && r.expectedIsOOS)
    .length;

  if (!options.silent) {
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
  }

  return {
    truePos,
    falsePos,
    falseNeg,
    trueNeg,
  };
};

const _computePerformance = (confusion: ConfusionMatrix): OOSPerformance => {
  const { truePos, falsePos, falseNeg, trueNeg } = confusion;
  const total = truePos + falsePos + falseNeg + trueNeg;

  const accuracy = (truePos + trueNeg) / total;
  const precision = truePos / (truePos + falsePos);
  const recall = truePos / (truePos + falseNeg);
  const f1 = 2 * ((precision * recall) / (precision + recall));

  return { accuracy, precision, recall, f1 };
};

export const showOOSConfusion: typeof sdk.metrics.showOOSConfusion = async (
  results: sdk.Result<sdk.SingleLabel>[],
  options?: Partial<sdk.ViewOptions>
) => {
  options = options ?? {};
  const resolvedOptions = { ...DEFAULT_OPTIONS, ...options };

  let confusion: _.Dictionary<_.Dictionary<number>> = {};
  if (resolvedOptions.aggregateBy === "all") {
    confusion["all"] = _oosConfusion(results, resolvedOptions);
  } else if (resolvedOptions.aggregateBy === "seed") {
    const allSeeds = _.uniq(results.map((r) => r.metadata.seed));

    for (const seed of allSeeds) {
      const resultsOfSeed = results.filter((r) => r.metadata.seed === seed);
      const confusionForSeed = _oosConfusion(resultsOfSeed, resolvedOptions);
      confusion = _.merge(
        {},
        confusion,
        _.mapValues(confusionForSeed, (x) => ({ [seed]: x }))
      );
    }
  } else if (resolvedOptions.aggregateBy === "problem") {
    const allProblems = _.uniq(results.map((r) => r.metadata.problem));

    for (const prob of allProblems) {
      const resultsOfProb = results.filter((r) => r.metadata.problem === prob);
      const confusionForProb = _oosConfusion(resultsOfProb, resolvedOptions);
      confusion = _.merge(
        {},
        confusion,
        _.mapValues(confusionForProb, (x) => ({ [prob]: x }))
      );
    }
  }

  return confusion;
};

export const showOOSPerformance: typeof sdk.metrics.showOOSPerformance = async (
  results: sdk.Result<sdk.SingleLabel>[],
  options?: Partial<sdk.ViewOptions>
) => {
  options = options ?? {};
  const resolvedOptions = { ...DEFAULT_OPTIONS, ...options };
  const confusionOption = { ...resolvedOptions, ...{ silent: true } };

  let oosPerformance: _.Dictionary<_.Dictionary<number>> = {};
  if (resolvedOptions.aggregateBy === "all") {
    const confusion = _oosConfusion(results, confusionOption);
    oosPerformance["all"] = _computePerformance(confusion);
  } else if (resolvedOptions.aggregateBy === "seed") {
    const allSeeds = _.uniq(results.map((r) => r.metadata.seed));

    for (const seed of allSeeds) {
      const resultsOfSeed = results.filter((r) => r.metadata.seed === seed);
      const confusionForSeed = _oosConfusion(resultsOfSeed, confusionOption);
      const oosPerformanceForSeed = _computePerformance(confusionForSeed);
      oosPerformance = _.merge(
        {},
        oosPerformance,
        _.mapValues(oosPerformanceForSeed, (x) => ({ [seed]: x }))
      );
    }
  } else if (resolvedOptions.aggregateBy === "problem") {
    const allProblems = _.uniq(results.map((r) => r.metadata.problem));

    for (const prob of allProblems) {
      const resultsOfProb = results.filter((r) => r.metadata.problem === prob);
      const confusionForProb = _oosConfusion(resultsOfProb, confusionOption);
      const oosPerformanceForProb = _computePerformance(confusionForProb);

      oosPerformance = _.merge(
        {},
        oosPerformance,
        _.mapValues(oosPerformanceForProb, (x) => ({ [prob]: x }))
      );
    }
  }

  if (!resolvedOptions.silent) {
    console.log(chalk.green("OOS Accuracy, Precision and Recall"));
    console.table(roundNumbers2Level(oosPerformance, 4));
  }

  return oosPerformance;
};
