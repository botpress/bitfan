import * as sdk from "bitfan/sdk";
import _ from "lodash";

const DEFAULT_OPTIONS: sdk.ReportOptions = {
  groupBy: "all",
};

export function _makeSingleLevelReport<T extends sdk.ProblemType>(
  results: sdk.Result<T>[],
  metrics: sdk.Metric<T>[],
  group: string
): sdk.ScoreInfo[] {
  return metrics.map((m) => ({
    metric: m.name,
    group,
    score: m.eval(results),
  }));
}

const evaluateMetrics: typeof sdk.evaluateMetrics = <T extends sdk.ProblemType>(
  results: sdk.Result<T>[],
  metrics: sdk.Metric<T>[],
  options?: Partial<sdk.ReportOptions>
): sdk.PerformanceReport => {
  options = options ?? {};
  const resolvedOptions = { ...DEFAULT_OPTIONS, ...options };

  const scores: sdk.ScoreInfo[] = [];

  if (resolvedOptions.groupBy === "all") {
    scores.push(..._makeSingleLevelReport(results, metrics, "all"));
  } else if (resolvedOptions.groupBy === "seed") {
    const allSeeds = _.uniq(results.map((r) => r.metadata.seed));

    for (const seed of allSeeds) {
      const resultsOfSeed = results.filter((r) => r.metadata.seed === seed);
      scores.push(..._makeSingleLevelReport(resultsOfSeed, metrics, `${seed}`));
    }
  } else if (resolvedOptions.groupBy === "problem") {
    const allProblems = _.uniq(results.map((r) => r.metadata.problem));

    for (const prob of allProblems) {
      const resultsOfProb = results.filter((r) => r.metadata.problem === prob);
      scores.push(..._makeSingleLevelReport(resultsOfProb, metrics, prob));
    }
  }

  return {
    generatedOn: new Date(),
    groupedBy: resolvedOptions.groupBy,
    scores,
  };
};
export default evaluateMetrics;
