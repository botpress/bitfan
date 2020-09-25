import _ from "lodash";
import * as sdk from "src/bitfan";
import chalk from "chalk";

import { binaryIntentScore } from "./builtin/metrics/intent";
import DatasetRepository from "./services/dataset-repository";
import { trainTestSplit } from "./builtin/tools/trainTestSplit";

const dataRepo = new DatasetRepository();

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
    bpdsRegressionA_train: dataRepo.getDataset("intent", "en", "bpdsA-train"),
    bpdsRegressionA_test: dataRepo.getDataset("intent", "en", "bpdsA-test"),
  },

  metrics: {
    binaryIntentScore,
  },
};

export default impl;
