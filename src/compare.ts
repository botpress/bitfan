import * as sdk from "bitfan/sdk";
import _ from "lodash";
import { initDic } from "./builtin/tables/init";

export default function comparePerformances(
  currentPerformance: sdk.PerformanceReport,
  previousPerformance: sdk.PerformanceReport,
  options?: Partial<sdk.CompareOptions>
): sdk.ComparisonReport {
  const currentMetrics = _.uniq(
    currentPerformance.scores.map((s) => s.metric)
  ).sort();
  const currentProblems = _.uniq(
    currentPerformance.scores.map((s) => s.problem)
  ).sort();
  const currentSeeds = _.uniq(
    currentPerformance.scores.map((s) => s.seed)
  ).sort();

  const defaultTolerance = initDic(currentMetrics, () => 0);
  const userDefinedTolerance = options?.toleranceByMetric ?? {};
  const toleranceByMetric = {
    ...defaultTolerance,
    ...userDefinedTolerance,
  };

  let status: sdk.RegressionStatus = "success";

  const reasons: sdk.RegressionReason[] = [];
  for (const metric of currentMetrics) {
    for (const problem of currentProblems) {
      for (const seed of currentSeeds) {
        const isComb = (s: sdk.ScoreInfo) =>
          s.metric === metric && s.problem === problem && s.seed === seed;
        const current = currentPerformance.scores.find(isComb);
        const previous = previousPerformance.scores.find(isComb);

        if (!previous || !current) {
          const combination = `{ metric: ${metric}, problem: ${problem}, seed: ${seed} }`;
          throw new Error(
            `No score could be found for combination ${combination} in previous or current performance.`
          );
        }

        const currentScore = current.score;
        const previousScore = previous.score;

        const delta = toleranceByMetric[metric] * previousScore;

        if (currentScore + delta < previousScore) {
          status = "regression";
          reasons.push({
            status,
            metric,
            problem,
            seed,
            currentScore,
            previousScore,
            allowedRegression: -delta,
          });
        } else if (currentScore < previousScore) {
          status = "tolerated-regression";
          reasons.push({
            status,
            metric,
            problem,
            seed,
            currentScore,
            previousScore,
            allowedRegression: -delta,
          });
        }
      }
    }
  }

  return {
    status,
    reasons,
  };
}
