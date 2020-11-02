import * as sdk from "bitfan/sdk";
import { isOOS } from "../../builtin/labels";

import { electMostConfident } from "../criterias/intent";
import _ from "lodash";

const DEFAULT_OPTIONS: sdk.AggregateOptions = {
  groupBy: "all",
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
  results: sdk.Result<sdk.SingleLabel>[]
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

export const oosConfusion: typeof sdk.metrics.oosConfusion = async (
  results: sdk.Result<sdk.SingleLabel>[],
  options?: Partial<sdk.AggregateOptions>
) => {
  options = options ?? {};
  const resolvedOptions = { ...DEFAULT_OPTIONS, ...options };

  let confusion: _.Dictionary<_.Dictionary<number>> = {};
  if (resolvedOptions.groupBy === "all") {
    confusion["all"] = _oosConfusion(results);
  } else if (resolvedOptions.groupBy === "seed") {
    const allSeeds = _.uniq(results.map((r) => r.metadata.seed));

    for (const seed of allSeeds) {
      const resultsOfSeed = results.filter((r) => r.metadata.seed === seed);
      const confusionForSeed = _oosConfusion(resultsOfSeed);
      confusion = _.merge(
        {},
        confusion,
        _.mapValues(confusionForSeed, (x) => ({ [seed]: x }))
      );
    }
  } else if (resolvedOptions.groupBy === "problem") {
    const allProblems = _.uniq(results.map((r) => r.metadata.problem));

    for (const prob of allProblems) {
      const resultsOfProb = results.filter((r) => r.metadata.problem === prob);
      const confusionForProb = _oosConfusion(resultsOfProb);
      confusion = _.merge(
        {},
        confusion,
        _.mapValues(confusionForProb, (x) => ({ [prob]: x }))
      );
    }
  }

  return confusion;
};

export const oosPerformance: typeof sdk.metrics.oosPerformance = async (
  results: sdk.Result<sdk.SingleLabel>[],
  options?: Partial<sdk.AggregateOptions>
) => {
  options = options ?? {};
  const resolvedOptions = { ...DEFAULT_OPTIONS, ...options };

  let oosPerformance: _.Dictionary<_.Dictionary<number>> = {};
  if (resolvedOptions.groupBy === "all") {
    const confusion = _oosConfusion(results);
    oosPerformance["all"] = _computePerformance(confusion);
  } else if (resolvedOptions.groupBy === "seed") {
    const allSeeds = _.uniq(results.map((r) => r.metadata.seed));

    for (const seed of allSeeds) {
      const resultsOfSeed = results.filter((r) => r.metadata.seed === seed);
      const confusionForSeed = _oosConfusion(resultsOfSeed);
      const oosPerformanceForSeed = _computePerformance(confusionForSeed);
      oosPerformance = _.merge(
        {},
        oosPerformance,
        _.mapValues(oosPerformanceForSeed, (x) => ({ [seed]: x }))
      );
    }
  } else if (resolvedOptions.groupBy === "problem") {
    const allProblems = _.uniq(results.map((r) => r.metadata.problem));

    for (const prob of allProblems) {
      const resultsOfProb = results.filter((r) => r.metadata.problem === prob);
      const confusionForProb = _oosConfusion(resultsOfProb);
      const oosPerformanceForProb = _computePerformance(confusionForProb);

      oosPerformance = _.merge(
        {},
        oosPerformance,
        _.mapValues(oosPerformanceForProb, (x) => ({ [prob]: x }))
      );
    }
  }

  return oosPerformance;
};
