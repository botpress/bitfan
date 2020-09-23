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
    bpdsRegressionA: dataRepo.getDataset("intent", "en", "bpds-a"),
    bpdsRegressionB: {} as sdk.DataSet<"intent">,
    bpdsRegressionC: {} as sdk.DataSet<"intent">,
    bpdsRegressionD: {} as sdk.DataSet<"intent">,
    bpdsRegressionE: {} as sdk.DataSet<"intent">,
    bpdsRegressionF: {} as sdk.DataSet<"intent">,

    bpdsSlotA: {} as sdk.DataSet<"slot">,
    bpdsSlotB: {} as sdk.DataSet<"slot">,
    bpdsSlotC: {} as sdk.DataSet<"slot">,
    bpdsSlotD: {} as sdk.DataSet<"slot">,
    bpdsSlotE: {} as sdk.DataSet<"slot">,
    bpdsSlotF: {} as sdk.DataSet<"slot">,
    bpdsSlotG: {} as sdk.DataSet<"slot">,
    bpdsSlotH: {} as sdk.DataSet<"slot">,
    bpdsSlotI: {} as sdk.DataSet<"slot">,
    bpdsSlotJ: {} as sdk.DataSet<"slot">,
  },

  metrics: {
    binaryIntentScore,
  },
};

export default impl;
