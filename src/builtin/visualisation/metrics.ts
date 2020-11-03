import * as sdk from "bitfan/sdk";
import chalk from "chalk";
import _ from "lodash";
import { roundNumbers } from "../../services/logging";

const _roundReport = (
  table: _.Dictionary<_.Dictionary<number>>,
  precision = 4
) => {
  return _.mapValues(table, (t) => roundNumbers(t, precision));
};

export const showReport: typeof sdk.visualisation.showReport = async (
  report: sdk.PerformanceReport
) => {
  console.log(chalk.green("Report Summary: "));
  console.table(_roundReport(report, 4));
};
