import * as sdk from "bitfan/sdk";
import chalk from "chalk";
import _ from "lodash";
import { initDictionnary } from "../../services/dic-utils";
import { roundNumbers } from "../../services/logging";

const _roundReport = (
  table: _.Dictionary<_.Dictionary<number>>,
  precision = 4
) => {
  return _.mapValues(table, (t) => roundNumbers(t, precision));
};

export const toTable = (report: sdk.PerformanceReport) => {
  const { scores } = report;

  const allMetrics = _.uniq(scores.map((s) => s.metric));
  const allGroups = _.uniq(scores.map((s) => s.group));

  const perMetric = initDictionnary(allGroups, () => 0);
  const table = initDictionnary(allMetrics, () => ({ ...perMetric }));

  for (const { metric, group, score } of scores) {
    table[metric][group] = score;
  }

  return table;
};

export const showReport: typeof sdk.visualisation.showReport = async (
  report: sdk.PerformanceReport
) => {
  const table = toTable(report);
  console.log(chalk.green("Report Summary: "));
  console.table(_roundReport(table, 4));
};
