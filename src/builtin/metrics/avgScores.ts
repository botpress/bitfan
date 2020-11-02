import chalk from "chalk";
import _ from "lodash";
import * as sdk from "src/bitfan";
import { roundNumbers1Level } from "../../services/logging";

const DEFAULT_OPTIONS: sdk.ViewOptions = {
  aggregateBy: "all",
  silent: false,
};

const _avgByMetrics = <T extends sdk.ProblemType>(
  metrics: string[],
  results: sdk.Result<T>[]
) => {
  const scoresByMetrics: _.Dictionary<number[]> = {};
  for (const metric of metrics) {
    scoresByMetrics[metric] = [];
    for (const result of results) {
      if (_.isNumber(result.scores[metric])) {
        scoresByMetrics[metric].push(result.scores[metric]);
      }
    }
  }

  const avgByMetrics = _.mapValues(scoresByMetrics, (scores) => {
    return _.sum(scores) / scores.length;
  });

  return roundNumbers1Level(avgByMetrics, 4);
};

const _discoverMetrics = <T extends sdk.ProblemType>(
  results: sdk.Result<T>[]
): string[] => {
  const allMetrics: string[] = [];
  for (const res of results) {
    allMetrics.push(...Object.keys(res.scores));
  }
  return _.uniq(allMetrics);
};

export const showAverageScores: typeof sdk.metrics.showAverageScores = async <
  T extends sdk.ProblemType
>(
  results: sdk.Result<T>[],
  options?: Partial<sdk.ViewOptions>
) => {
  options = options ?? {};
  const resolvedOptions = { ...DEFAULT_OPTIONS, ...options };

  let avgByMetrics: _.Dictionary<_.Dictionary<number>> = {};

  const metrics = _discoverMetrics(results);

  if (resolvedOptions.aggregateBy === "all") {
    avgByMetrics["all"] = _avgByMetrics<T>(metrics, results);
  } else if (resolvedOptions.aggregateBy === "seed") {
    const allSeeds = _.uniq(results.map((r) => r.metadata.seed));

    for (const seed of allSeeds) {
      const resultsOfSeed = results.filter((r) => r.metadata.seed === seed);
      const avgByMetricsForSeed = _avgByMetrics<T>(metrics, resultsOfSeed);
      avgByMetrics = _.merge(
        {},
        avgByMetrics,
        _.mapValues(avgByMetricsForSeed, (x) => ({ [seed]: x }))
      );
    }
  } else if (resolvedOptions.aggregateBy === "problem") {
    const allProblems = _.uniq(results.map((r) => r.metadata.problem));

    for (const prob of allProblems) {
      const resultsOfProb = results.filter((r) => r.metadata.problem === prob);
      const avgByMetricsForProb = _avgByMetrics<T>(metrics, resultsOfProb);
      avgByMetrics = _.merge(
        {},
        avgByMetrics,
        _.mapValues(avgByMetricsForProb, (x) => ({ [prob]: x }))
      );
    }
  }

  if (!options.silent) {
    console.log(chalk.green(`Average Score By Metrics`));
    console.table(avgByMetrics);
  }

  return avgByMetrics;
};
