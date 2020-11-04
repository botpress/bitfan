import * as sdk from "bitfan/sdk";
import _ from "lodash";
import { toTable } from "./builtin/visualisation/report";
import { initDictionnary } from "./services/dic-utils";

export default function comparePerformances(
  currentPerformance: sdk.PerformanceReport,
  previousPerformance: sdk.PerformanceReport,
  options?: Partial<sdk.CompareOptions>
): sdk.ComparisonReport {
  if (currentPerformance.groupedBy !== previousPerformance.groupedBy) {
    let msg =
      "Bitfan can only compare two performances if both are grouped the same way.\n" +
      `Currently trying to compare a report by ${currentPerformance.groupedBy} with a report by ${previousPerformance.groupedBy}.`;
    throw new Error(msg);
  }

  const currentMetrics = _.uniq(
    currentPerformance.scores.map((s) => s.metric)
  ).sort();
  const previousMetrics = _.uniq(
    previousPerformance.scores.map((s) => s.metric)
  ).sort();
  if (!_.isEqual(currentMetrics, previousMetrics)) {
    const diff = currentMetrics
      .filter((m) => !previousMetrics.includes(m))
      .join(", ");

    let msg =
      "Bitfan can only compare two performances if both are evaluated on the same metrics.\n" +
      `Metrics [${diff}] seems to not be available in previous report.`;
    throw new Error(msg);
  }

  const currentGroups = _.uniq(
    currentPerformance.scores.map((s) => s.group)
  ).sort();
  const previousGroups = _.uniq(
    previousPerformance.scores.map((s) => s.group)
  ).sort();
  if (!_.isEqual(currentGroups, previousGroups)) {
    const diff = currentGroups
      .filter((g) => !previousGroups.includes(g))
      .join(", ");
    let msg =
      "Bitfan can only compare two performances if both are evaluated on the same seed or problem.\n" +
      `Groups [${diff}] seems to not be available in previous report.`;
    throw new Error(msg);
  }

  const defaultTolerance = initDictionnary(currentMetrics, () => 0);
  const userDefinedTolerance = options?.toleranceByMetrics ?? {};
  const toleranceByMetric = {
    ...defaultTolerance,
    ...userDefinedTolerance,
  };

  const currentTable = toTable(currentPerformance);
  const previousTable = toTable(previousPerformance);

  let status: sdk.RegressionStatus = "success";

  const reasons: sdk.RegressionReason[] = [];
  for (const metric of currentMetrics) {
    for (const group of currentGroups) {
      const currentScore = currentTable[metric][group];
      const previousScore = previousTable[metric][group];

      const delta = toleranceByMetric[metric] * previousScore;

      if (currentScore + delta < previousScore) {
        status = "regression";
        reasons.push({
          metric,
          group,
          currentScore,
          previousScore,
          allowedRegression: -delta,
        });
      } else if (currentScore < previousScore) {
        status = "tolerated-regression";
        reasons.push({
          metric,
          group,
          currentScore,
          previousScore,
          allowedRegression: -delta,
        });
      }
    }
  }

  return {
    status,
    reasons,
  };
}
