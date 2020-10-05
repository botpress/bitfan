import { DataSet, ProblemType, Row, tools } from "bitfan/sdk";
import { LoDashStatic } from "lodash";
import { areSame } from "../../services/labels";
import SeededLodashProvider from "../../services/seeded-lodash";

export const trainTestSplit: typeof tools.trainTestSplit = <
  T extends ProblemType
>(
  dataset: DataSet<T>,
  trainPercent: number,
  seed: number,
  options = { stratificate: true }
): {
  trainSet: DataSet<T>;
  testSet: DataSet<T>;
} => {
  if (trainPercent < 0 || trainPercent > 1) {
    throw new Error(
      `trainTestSplit function cannot make a train set with ${trainPercent} of all samples. Must be between 0 and 1`
    );
  }

  const seededLodashProvider = new SeededLodashProvider();
  seededLodashProvider.setSeed(seed);
  const lo = seededLodashProvider.getSeededLodash();

  const allClasses = lo.uniqWith(
    dataset.rows.map((r) => r.label),
    areSame
  );

  const trainSamples: Row<T>[] = [];
  const testSamples: Row<T>[] = [];

  if (options.stratificate) {
    // preserve proportions of each class
    for (const c of allClasses) {
      const samplesOfClass = dataset.rows.filter((r) => areSame(r.label, c));
      const split = _splitOneClass(samplesOfClass, trainPercent, lo);
      trainSamples.push(...split.trainSamples);
      testSamples.push(...split.testSamples);
    }
  } else {
    const split = _splitOneClass(dataset.rows, trainPercent, lo);
    trainSamples.push(...split.trainSamples);
    testSamples.push(...split.testSamples);
  }

  seededLodashProvider.resetSeed();

  const trainSet = { ...dataset, rows: trainSamples };
  const testSet = { ...dataset, rows: testSamples };
  return {
    trainSet,
    testSet,
  };
};

const _splitOneClass = <T extends ProblemType>(
  samplesOfClass: Row<T>[],
  trainPercent: number,
  seededLodash: LoDashStatic
): {
  trainSamples: Row<T>[];
  testSamples: Row<T>[];
} => {
  const N = samplesOfClass.length;
  const trainSize = Math.floor(trainPercent * N);

  const allIdx = seededLodash.shuffle(seededLodash.range(N));
  const trainIdx = allIdx.slice(0, trainSize);
  const testIdx = allIdx.slice(trainSize);

  const trainSamples = samplesOfClass.filter((r, i) => trainIdx.includes(i));
  const testSamples = samplesOfClass.filter((r, i) => testIdx.includes(i));

  return {
    trainSamples,
    testSamples,
  };
};
