import { DataSet, ProblemType, visualisation } from "bitfan/sdk";
import chalk from "chalk";
import _ from "lodash";
import { areSame, makeKey } from "../../services/labels";

type NamedDataSet<T extends ProblemType> = DataSet<T> & { name: string };

export const showClassDistribution: typeof visualisation.showClassDistribution = <
  T extends ProblemType
>(
  ...datasets: NamedDataSet<T>[]
) => {
  const distributions: _.Dictionary<_.Dictionary<number>> = {};
  for (const ds of datasets) {
    const distribution = _getClassDistributionForOneSet(ds);
    distributions[ds.name] = distribution;
  }

  console.log(chalk.green(`Class Distribution`));
  console.table(_flipTable(distributions));
};

const _getClassDistributionForOneSet = <T extends ProblemType>(
  dataset: DataSet<T>
) => {
  const { rows } = dataset;

  const allLabels = _.uniqWith(
    rows.map((r) => r.label),
    areSame
  );

  const distribution = _.zipObject(
    allLabels.map(makeKey),
    allLabels.map((x) => 0)
  );

  const N = rows.length;
  for (const label of allLabels) {
    distribution[makeKey(label)] =
      rows.filter((r) => areSame(label, r.label)).length / N;
  }

  return distribution;
};

const _flipTable = (table: _.Dictionary<_.Dictionary<number>>) => {
  const columns = Object.keys(table);

  let rows: string[] = [];
  for (const col of columns) {
    rows = [...rows, ...Object.keys(table[col])];
  }
  rows = _.uniq(rows);

  const flipped = _.zipObject(
    rows,
    rows.map((r) => ({}))
  );

  for (const row of rows) {
    flipped[row] = _.zipObject(
      columns,
      columns.map((c) => table[c][row])
    );
  }

  return flipped;
};
