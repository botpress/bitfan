import * as sdk from "bitfan/sdk";
import chalk from "chalk";
import _ from "lodash";
import { roundNumbers2Level } from "../../services/logging";

export const showReport: typeof sdk.visualisation.showReport = async (
  report: sdk.PerformanceReport
) => {
  console.log(chalk.green("Report Summary: "));
  console.table(roundNumbers2Level(report, 4));
};
