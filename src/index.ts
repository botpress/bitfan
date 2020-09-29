import _ from "lodash";
import * as sdk from "src/bitfan";
import chalk from "chalk";

import {
  binaryIntentScore,
  binaryIntentOOSScore,
} from "./builtin/metrics/intent";
import DatasetRepository from "./services/dataset-repository";
import { trainTestSplit } from "./builtin/tools/trainTestSplit";

import { BpIntentOOSEngine } from "./builtin/engines/intent";
import { sleep } from "./utils";
import { MetricHolder } from "./services/metricHolder";

const dsRepo = new DatasetRepository();

const runSolution = async <T extends sdk.ProblemType>(
  solution: sdk.Solution<T>,
  seed: number
) => {
  const { engine, metrics } = solution;
  const metricHolder = new MetricHolder(metrics);

  for (const problem of solution.problems) {
    try {
      console.log(chalk.green(chalk.bold(`Problem ${problem.name}`)));

      await engine.train(problem.trainSet, seed);

      await sleep(1000);

      const results = await engine.predict(problem.testSet);

      const scores = metrics.map((m) => results.map(m.eval));
      const scoresByMetrics = _.zipObject(metricHolder.names, scores);
      metricHolder.setScoresForProblem(problem, scoresByMetrics);

      const avgByMetrics = metricHolder.getAvgForProblem(problem);

      console.log(chalk.green(`Average Score By Metrics`));
      console.table(
        _.map(avgByMetrics, (v, k) => ({ metric: k, score: v })),
        ["metric", "score"]
      );
      console.log("\n");

      await problem.cb(results, avgByMetrics);
    } catch (err) {
      console.log(
        chalk.red(
          `The following error occured when running problem ${problem.name}:\n${err.message}`
        )
      );
      process.exit(1);
    }
  }

  console.log(chalk.green(chalk.bold("Summary For All Problems")));
  const avgByMetrics = metricHolder.getAvg();

  console.log(chalk.green(`Average Score By Metrics`));
  console.table(
    _.map(avgByMetrics, (v, k) => ({ metric: k, score: v })),
    ["metric", "score"]
  );
};

// TODO: write actual implementation
const impl: typeof sdk = {
  runSolution,

  tools: {
    trainTestSplit,
  },

  datasets: {
    bpds: {
      regression: {
        train: {
          A: dsRepo.getDataset("intent-oos", "en", "bpdsA-train"),
          B: dsRepo.getDataset("intent-oos", "en", "bpdsB-train"),
          C: dsRepo.getDataset("intent-oos", "en", "bpdsC-train"),
          D: dsRepo.getDataset("intent-oos", "en", "bpdsD-train"),
          E: dsRepo.getDataset("intent-oos", "en", "bpdsE-train"),
          F: dsRepo.getDataset("intent-oos", "en", "bpdsF-train"),
        },
        test: {
          A: dsRepo.getDataset("intent-oos", "en", "bpdsA-test"),
          B: dsRepo.getDataset("intent-oos", "en", "bpdsB-test"),
          C: dsRepo.getDataset("intent-oos", "en", "bpdsC-test"),
          D: dsRepo.getDataset("intent-oos", "en", "bpdsD-test"),
          E: dsRepo.getDataset("intent-oos", "en", "bpdsE-test"),
          F: dsRepo.getDataset("intent-oos", "en", "bpdsF-test"),
        },
      },
    },
  },

  metrics: {
    binaryIntentScore,
  },

  engines: {
    BpIntentOOSEngine,
  },
};

export default impl;
