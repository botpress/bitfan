import chalk from "chalk";
import _ from "lodash";
import * as sdk from "src/bitfan";
import { roundNumbers2Level } from "../../services/logging";
import { averageScores } from "../metrics/avgScores";

export const showAverageScores: typeof sdk.visualisation.showAverageScores = async <
  T extends sdk.ProblemType
>(
  results: sdk.Result<T>[],
  options?: Partial<sdk.AggregateOptions>
) => {
  const scores = await averageScores(results, options);
  console.log(chalk.green(`Average Score By Metrics`));
  console.table(roundNumbers2Level(scores, 4));
};
