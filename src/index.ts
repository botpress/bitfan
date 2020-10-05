import _ from "lodash";
import * as sdk from "src/bitfan";
import chalk from "chalk";

import {
  mostConfidentBinaryScore,
  oosBinaryScore,
} from "./builtin/metrics/intent";

import { showOOSConfusion } from "./builtin/visualisation/oos";
import { showAverageScoreByMetric } from "./builtin/visualisation/metrics";

import DatasetRepository from "./services/dataset-repository";
import { trainTestSplit } from "./builtin/tools/trainTestSplit";
import { splitOOS, pickOOS } from "./builtin/tools/splitAndMakeOOS";

import { BpIntentEngine } from "./builtin/engines/intent";
import { sleep } from "./utils";

import { areSame, isOOS } from "./services/labels";

const dsRepo = new DatasetRepository();

const runSolution = async <T extends sdk.ProblemType>(
  solution: sdk.Solution<T>,
  seeds: number[]
) => {
  const { engine, metrics, name, problems } = solution;

  const allResults: sdk.Result<T>[] = [];

  for (const seed of seeds) {
    console.log(
      chalk.green(chalk.bold(`Running Solution ${name} with seed ${seed}`))
    );

    const solutionResults: sdk.Result<T>[] = [];

    for (const problem of problems) {
      try {
        console.log(chalk.green(chalk.bold(`Problem ${problem.name}`)));

        await engine.train(problem.trainSet, seed);

        await sleep(1000);

        const predictOutputs = await engine.predict(problem.testSet);
        const results: sdk.Result<T>[] = predictOutputs.map((p) => {
          const metricsNames = metrics.map((m) => m.name);
          const metricsScores = metrics.map((m) => m.eval(p));
          return {
            ...p,
            scores: _.zipObject(metricsNames, metricsScores),
            metadata: {
              seed,
              problem: problem.name,
            },
          };
        });

        solutionResults.push(...results);

        if (!!problem.cb) {
          console.log(
            chalk.green(chalk.bold(`Results for Problem ${problem.name}`))
          );
          await problem.cb(results);
          console.log("\n");
        }
      } catch (err) {
        console.log(
          chalk.red(
            `The following error occured when solving problem ${problem.name} with seed ${seed}:\n${err.message}`
          )
        );
        process.exit(1);
      }
    }

    allResults.push(...solutionResults);

    if (!!solution.cb) {
      console.log(chalk.green(chalk.bold(`Results for All Problems`)));
      await solution.cb(solutionResults);
      console.log("\n");
    }
  }

  return allResults;
};

// TODO: write actual implementation
const impl: typeof sdk = {
  runSolution,
  areSame,
  isOOS,

  tools: {
    trainTestSplit,
    splitOOS,
    pickOOS,
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
    showAverageScoreByMetric,
  },

  engines: {
    BpIntentEngine,
  },
};

export default impl;
