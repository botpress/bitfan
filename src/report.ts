import * as sdk from "bitfan/sdk";
import _ from "lodash";

const DEFAULT_OPTIONS: sdk.AggregateOptions = {
  groupBy: "all",
};

export function _makeSingleLevelReport<T extends sdk.ProblemType>(
  results: sdk.Result<T>[],
  metrics: sdk.Metric<T>[]
): sdk.Dic<number> {
  let report: sdk.Dic<number> = {};
  for (const metric of metrics) {
    report[metric.name] = metric.eval(results);
  }
  return report;
}

const evaluateMetrics: typeof sdk.evaluateMetrics = <T extends sdk.ProblemType>(
  results: sdk.Result<T>[],
  metrics: sdk.Metric<T>[],
  options?: Partial<sdk.AggregateOptions>
): sdk.PerformanceReport => {
  options = options ?? {};
  const resolvedOptions = { ...DEFAULT_OPTIONS, ...options };

  let report: sdk.PerformanceReport = {};

  if (resolvedOptions.groupBy === "all") {
    report = _.mapValues(_makeSingleLevelReport(results, metrics), (x) => ({
      ["all"]: x,
    }));
  } else if (resolvedOptions.groupBy === "seed") {
    const allSeeds = _.uniq(results.map((r) => r.metadata.seed));

    for (const seed of allSeeds) {
      const resultsOfSeed = results.filter((r) => r.metadata.seed === seed);
      const avgForSeed = _makeSingleLevelReport(resultsOfSeed, metrics);
      report = _.merge(
        {},
        report,
        _.mapValues(avgForSeed, (x) => ({ [seed]: x }))
      );
    }
  } else if (resolvedOptions.groupBy === "problem") {
    const allProblems = _.uniq(results.map((r) => r.metadata.problem));

    for (const prob of allProblems) {
      const resultsOfProb = results.filter((r) => r.metadata.problem === prob);
      const avgForProb = _makeSingleLevelReport(resultsOfProb, metrics);
      report = _.merge(
        {},
        report,
        _.mapValues(avgForProb, (x) => ({ [prob]: x }))
      );
    }
  }

  return report;
};
export default evaluateMetrics;
