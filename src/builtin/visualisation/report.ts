import * as sdk from "bitfan/sdk";
import chalk from "chalk";
import _ from "lodash";
import { initDictionnary } from "src/services/dic-utils";
import { roundNumbers } from "../../services/logging";

const _roundReport = (
  table: _.Dictionary<_.Dictionary<number>>,
  precision = 4
) => {
  return _.mapValues(table, (t) => roundNumbers(t, precision));
};

const _initTable = <T extends any>(
  rows: string[],
  columns: string[],
  init: T
) => {
  const perRow = initDictionnary(rows, () => init);
  return initDictionnary(columns, () => ({ ...perRow }));
};

export const tabelize: typeof sdk.visualisation.tabelize = <D>(
  data: D[],
  disposition: {
    row: (d: D) => string;
    column: (d: D) => string;
    score: (d: D) => number;
    agg?: (scores: number[]) => number;
  }
): sdk.Dic<sdk.Dic<number>> => {
  const average = (n: number[]) => _.sum(n) / n.length;
  const aggregator = disposition.agg ?? average;

  const allRows = data.map((d) => disposition.row(d));
  const allColumns = data.map((d) => disposition.column(d));

  const rawTable = _initTable<number[]>(allRows, allColumns, []);
  for (const d of data) {
    rawTable[disposition.row(d)][disposition.column(d)].push(
      disposition.score(d)
    );
  }

  const table = _initTable(allRows, allColumns, 0);
  for (const row of allRows) {
    for (const column of allColumns) {
      table[row][column] = aggregator(rawTable[row][column]);
    }
  }

  return _roundReport(table);
};

const DEFAULT_OPT: {
  groupBy: "seed" | "problem" | "all";
} = {
  groupBy: "all",
};

export const showReport: typeof sdk.visualisation.showReport = async (
  report: sdk.PerformanceReport,
  opt?: Partial<{
    groupBy: "seed" | "problem" | "all";
  }>
) => {
  const options = { ...DEFAULT_OPT, ...(opt ?? {}) };

  const table = tabelize(report.scores, {
    row: (s) => s.metric,
    column: (s) =>
      options.groupBy === "seed"
        ? `${s.seed}`
        : options.groupBy === "problem"
        ? s.problem
        : "all",
    score: (s) => s.score,
  });

  console.log(chalk.green("Report Summary: "));
  console.table(table);
};
