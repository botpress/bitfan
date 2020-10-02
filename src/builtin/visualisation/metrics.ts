import chalk from "chalk";
import _ from "lodash";
import * as sdk from "src/bitfan";

const DEFAULT_OPTIONS: sdk.AggregationOption = {
  aggregateBy: "all",
};

const _avgByMetrics = <T extends sdk.ProblemType>(
  metrics: sdk.Metric<T>[],
  results: sdk.Result<T>[]
) => {
  const scoresByMetrics: _.Dictionary<number[]> = {};
  for (const metric of metrics.map((m) => m.name)) {
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

  return avgByMetrics;
};

export const showAverageScoreByMetric: typeof sdk.visualisation.showAverageScoreByMetric = <
  T extends sdk.ProblemType
>(
  metrics: sdk.Metric<T>[],
  options?: Partial<sdk.AggregationOption>
) => async (results: sdk.Result<T>[]) => {
  options = options ?? {};
  const resolvedOptions = { ...DEFAULT_OPTIONS, ...options };

  let avgByMetrics: Object = {};

  if (resolvedOptions.aggregateBy === "all") {
    avgByMetrics = _avgByMetrics<T>(metrics, results);
  } else if (resolvedOptions.aggregateBy === "seed") {
    const allSeeds = _.uniq(results.map((r) => r.metadata.seed));

    for (const seed of allSeeds) {
      const resultsOfSeed = results.filter((r) => r.metadata.seed === seed);
      const avgByMetricsForSeed = _avgByMetrics<T>(metrics, resultsOfSeed);
      avgByMetrics = _.merge(
        {},
        avgByMetrics,
        _.mapValues(avgByMetricsForSeed, (x) => ({ [`${seed}`]: x }))
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
        _.mapValues(avgByMetricsForProb, (x) => ({ [`${prob}`]: x }))
      );
    }
  }

  console.log(chalk.green(`Average Score By Metrics`));
  console.table(avgByMetrics);
};
