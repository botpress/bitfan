import { DataSet, ProblemType, metrics } from "bitfan/sdk";
import chalk from "chalk";
import _ from "lodash";
import { flipTable, roundNumbers } from "../../services/logging";
import { areSame, isOOS, makeKey } from "../../builtin/labels";

export const showClassDistribution: typeof metrics.showClassDistribution = (
  ...datasets: DataSet<ProblemType>[]
) => {
  const distributions: _.Dictionary<_.Dictionary<number>> = {};
  for (const ds of datasets) {
    const distribution = _getClassDistributionForOneSet(ds);
    distributions[ds.name] = roundNumbers(distribution, 4);
  }

  console.log(chalk.green(`Class Distribution`));
  console.table(flipTable(distributions));
};

export const showDatasetsSummary: typeof metrics.showDatasetsSummary = (
  ...datasets: DataSet<ProblemType>[]
) => {
  const summaries: _.Dictionary<_.Dictionary<number>> = {};
  for (const ds of datasets) {
    const amountOfSamples = ds.samples.length;
    const classes = _.uniqWith(
      ds.samples.map((r) => r.label),
      areSame
    ).filter((c) => !isOOS(c));

    const amountOfSamplesPerClass = classes.map(
      (c) => ds.samples.filter((r) => areSame(r.label, c)).length
    );
    const avgSamplesPerClass =
      _.sum(amountOfSamplesPerClass) / amountOfSamplesPerClass.length;

    const maxSamplesPerClass = _.max(amountOfSamplesPerClass) ?? 0;
    const minSamplesPerClass = _.min(amountOfSamplesPerClass) ?? 0;

    const amountOfClass = classes.length;

    const oosSamples = ds.samples.filter((r) => isOOS(r.label)).length;

    const summary = {
      amountOfSamples,
      amountOfClass,
      avgSamplesPerClass,
      maxSamplesPerClass,
      minSamplesPerClass,
      oosSamples,
    };
    summaries[ds.name] = roundNumbers(summary, 4);
  }

  console.log(chalk.green(`Dataset summary`));
  console.table(flipTable(summaries));
};

const _getClassDistributionForOneSet = <T extends ProblemType>(
  dataset: DataSet<T>
) => {
  const { samples: rows } = dataset;

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
