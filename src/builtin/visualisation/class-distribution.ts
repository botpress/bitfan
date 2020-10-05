import { DataSet, ProblemType, visualisation } from "bitfan/sdk";
import chalk from "chalk";
import _ from "lodash";
import { flipTable, roundNumbers } from "../../services/logging";
import { areSame, isOOS, makeKey } from "../../services/labels";

type NamedDataSet<T extends ProblemType> = DataSet<T> & { name: string };

export const showClassDistribution: typeof visualisation.showClassDistribution = <
  T extends ProblemType
>(
  ...datasets: NamedDataSet<T>[]
) => {
  const distributions: _.Dictionary<_.Dictionary<number | boolean>> = {};
  for (const ds of datasets) {
    const distribution = _getClassDistributionForOneSet(ds);
    distributions[ds.name] = roundNumbers(distribution, 4);
  }

  console.log(chalk.green(`Class Distribution`));
  console.table(flipTable(distributions));
};

export const showDatasetsSummary: typeof visualisation.showDatasetsSummary = <
  T extends ProblemType
>(
  ...datasets: NamedDataSet<T>[]
) => {
  const summaries: _.Dictionary<_.Dictionary<number | boolean>> = {};
  for (const ds of datasets) {
    const amountOfSamples = ds.rows.length;
    const classes = _.uniqWith(
      ds.rows.map((r) => r.label),
      areSame
    ).filter((c) => !isOOS(c));

    const amountOfSamplesPerClass = classes.map(
      (c) => ds.rows.filter((r) => areSame(r.label, c)).length
    );
    const avgSamplesPerClass =
      _.sum(amountOfSamplesPerClass) / amountOfSamplesPerClass.length;

    const maxSamplesPerClass = _.max(amountOfSamplesPerClass) ?? 0;
    const minSamplesPerClass = _.min(amountOfSamplesPerClass) ?? 0;

    const amountOfClass = classes.length;

    const hasOOS = ds.rows.some((r) => isOOS(r.label));

    const summary = {
      amountOfSamples,
      amountOfClass,
      avgSamplesPerClass,
      maxSamplesPerClass,
      minSamplesPerClass,
      hasOOS,
    };
    summaries[ds.name] = roundNumbers(summary, 4);
  }

  console.log(chalk.green(`Dataset summary`));
  console.table(flipTable(summaries));
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
