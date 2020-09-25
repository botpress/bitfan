import _ from "lodash";
import * as sdk from "src/bitfan";
import chalk from "chalk";

import {
  binaryIntentScore,
  binaryIntentOOSScore,
} from "./builtin/metrics/intent";
import DatasetRepository from "./services/dataset-repository";
import { trainTestSplit } from "./builtin/tools/trainTestSplit";

const dsRepo = new DatasetRepository();

const runSolution = <T extends sdk.ProblemType>(
  solution: sdk.Solution<T>,
  seeds: number[]
) => {
  const { engine } = solution;

  for (const seed of seeds) {
    for (const problem of solution.problems) {
      engine.train(problem.trainSet, seed);
      const results = engine.predict(problem.testSet);
      const metricsName = problem.metrics.map((m) => m.name);
      const scores = problem.metrics.map((m) => results.map(m.eval));
      const scoresByMetrics = _.zipObject(metricsName, scores);

      const avgByMetrics = _.mapValues(scoresByMetrics, (scores) => {
        return _.sum(scores) / scores.length;
      });

      for (const metricName of Object.keys(avgByMetrics)) {
        console.log(
          chalk.green(
            `Average Score for Metric ${metricName}: ${avgByMetrics[metricName]}`
          )
        );
      }

      problem.visualisationFunction(problem.trainSet, problem.testSet, results);
    }
  }
};

// TODO: write actual implementation
const impl: typeof sdk = {
  runSolution,

  tools: {
    trainTestSplit,
  },

  datasets: {
    bpdsRegressionA_train: dsRepo.getDataset("intent-oos", "en", "bpdsA-train"),
    bpdsRegressionA_test: dsRepo.getDataset("intent-oos", "en", "bpdsA-test"),
    bpdsRegressionB_train: dsRepo.getDataset("intent-oos", "en", "bpdsB-train"),
    bpdsRegressionB_test: dsRepo.getDataset("intent-oos", "en", "bpdsB-test"),
    bpdsRegressionC_train: dsRepo.getDataset("intent-oos", "en", "bpdsC-train"),
    bpdsRegressionC_test: dsRepo.getDataset("intent-oos", "en", "bpdsC-test"),
    bpdsRegressionD_train: dsRepo.getDataset("intent-oos", "en", "bpdsD-train"),
    bpdsRegressionD_test: dsRepo.getDataset("intent-oos", "en", "bpdsD-test"),
    bpdsRegressionE_train: dsRepo.getDataset("intent-oos", "en", "bpdsE-train"),
    bpdsRegressionE_test: dsRepo.getDataset("intent-oos", "en", "bpdsE-test"),
    bpdsRegressionF_train: dsRepo.getDataset("intent-oos", "en", "bpdsF-train"),
    bpdsRegressionF_test: dsRepo.getDataset("intent-oos", "en", "bpdsF-test"),
  },

  metrics: {
    binaryIntentScore,
    binaryIntentOOSScore,
  },
};

export default impl;
