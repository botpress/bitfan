import { DataSet, IntentOrTopic, Row } from "bitfan/sdk";
import _ from "lodash";
import SeededLodashProvider from "../../services/seeded-lodash";
import { trainTestSplit } from "./trainTestSplit";

type Count = { count: number };
type Labels = { labels: string[] };

const DEFAULT_OPTIONS: Count = {
  count: 1,
};

export const splitAndMakeOOS = <T extends IntentOrTopic>(
  dataset: DataSet<T>,
  trainPercent: number,
  seed: number,
  options?: Count | Labels
) => {
  options = options ?? DEFAULT_OPTIONS;
  if (_isLabels(options)) {
    return _splitAndMakeOOSFromLabels(
      dataset,
      trainPercent,
      seed,
      options.labels
    );
  }
  return _splitAndMakeOOSRandomly(dataset, trainPercent, seed, options.count);
};

const _splitAndMakeOOSFromLabels = <T extends IntentOrTopic>(
  dataset: DataSet<T>,
  trainPercent: number,
  seed: number,
  labels: string[]
) => {
  const { lang, type, rows } = dataset;

  const rowsOfLabels = rows.filter((r) => labels.includes(r.label));
  const otherRows = rows.filter((r) => !labels.includes(r.label));

  const { trainSet, testSet } = trainTestSplit(
    { lang, type, rows: otherRows },
    trainPercent,
    seed
  );

  const oosRows: Row<IntentOrTopic>[] = rowsOfLabels.map((r) => ({
    ...r,
    label: "oos",
  }));
  testSet.rows.push(...oosRows);

  return { trainSet, testSet };
};

// picks N labels to make them oos in the test set
const _splitAndMakeOOSRandomly = <T extends IntentOrTopic>(
  dataset: DataSet<T>,
  trainPercent: number,
  seed: number,
  count: number
) => {
  const { rows } = dataset;
  const allLabels = _.uniq(rows.map((r) => r.label));

  const seededLodashProvider = new SeededLodashProvider();
  seededLodashProvider.setSeed(seed);
  const lo = seededLodashProvider.getSeededLodash();

  const suffled = lo.shuffle(allLabels);
  const pickedLabels = lo.take(allLabels, count);

  const split = _splitAndMakeOOSFromLabels(
    dataset,
    trainPercent,
    seed,
    pickedLabels
  );

  seededLodashProvider.resetSeed();

  return split;
};

const _isLabels = (options: Labels | Count): options is Labels => {
  return !!(options as Labels).labels;
};
