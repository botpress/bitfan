import _ from "lodash";
import * as sdk from "src/bitfan";
import chalk from "chalk";

import {
  mostConfidentBinaryScore,
  oosBinaryScore,
} from "./builtin/metrics/intent";

import { showOOSConfusion } from "./builtin/visualisation/oos";

import DatasetRepository from "./services/dataset-repository";
import { trainTestSplit } from "./builtin/tools/trainTestSplit";

import { BpIntentEngine } from "./builtin/engines/intent";
import { sleep } from "./utils";
import { MetricHolder } from "./services/metricHolder";

import { areSame, isOOS } from "./services/labels";

const dsRepo = new DatasetRepository();

const runSolution = async <T extends sdk.ProblemType>(
  solution: sdk.Solution<T>,
  seed: number
) => {
  const { engine, metrics, name } = solution;

  console.log(
    chalk.green(chalk.bold(`Running Solution ${name} with seed ${seed}`))
  );

  const metricHolder = new MetricHolder(metrics);
  const solutionResults: sdk.Result<T>[] = [];

  for (const problem of solution.problems) {
    try {
      console.log(chalk.green(chalk.bold(`Problem ${problem.name}`)));

      await engine.train(problem.trainSet, seed);

      await sleep(1000);

      const results = await engine.predict(problem.testSet);
      solutionResults.push(...results);

      const scores = metrics.map((m) => results.map(m.eval));
      const scoresByMetrics = _.zipObject(metricHolder.names, scores);
      metricHolder.setScoresForProblem(problem, scoresByMetrics);

      const avgByMetrics = metricHolder.getAvgForProblem(problem);

      console.log(chalk.green(`Average Score By Metrics`));
      console.table(
        _.map(avgByMetrics, (v, k) => ({ metric: k, score: v })),
        ["metric", "score"]
      );

      await problem.cb?.(results, avgByMetrics);

      console.log("\n"); // to space out logging
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

  await solution.cb?.(solutionResults, avgByMetrics);
  console.log("\n"); // to space out logging
};

// TODO: write actual implementation
const impl: typeof sdk = {
  runSolution,
  areSame,
  isOOS,

  tools: {
    trainTestSplit,
  },

  datasets: {
    bpds: {
      regression: {
        train: {
          A: dsRepo.getDataset("intent", "en", "bpdsA-train"),
          B: dsRepo.getDataset("intent", "en", "bpdsB-train"),
          C: dsRepo.getDataset("intent", "en", "bpdsC-train"),
          D: dsRepo.getDataset("intent", "en", "bpdsD-train"),
          E: dsRepo.getDataset("intent", "en", "bpdsE-train"),
          F: dsRepo.getDataset("intent", "en", "bpdsF-train"),
        },
        test: {
          A: dsRepo.getDataset("intent", "en", "bpdsA-test"),
          B: dsRepo.getDataset("intent", "en", "bpdsB-test"),
          C: dsRepo.getDataset("intent", "en", "bpdsC-test"),
          D: dsRepo.getDataset("intent", "en", "bpdsD-test"),
          E: dsRepo.getDataset("intent", "en", "bpdsE-test"),
          F: dsRepo.getDataset("intent", "en", "bpdsF-test"),
        },
      },
    },
    covid: {
      en: dsRepo.getDataset("intent", "en", "covid"),
      fr: dsRepo.getDataset("intent", "fr", "covid"),
    },
  },

  metrics: {
    mostConfidentBinaryScore,
    oosBinaryScore,
  },

  visualisation: {
    showOOSConfusion,
  },

  engines: {
    BpIntentEngine,
  },
};

export default impl;
