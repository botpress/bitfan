import { DataSet, ProblemType, tools } from "bitfan/sdk";
import SeededLodashProvider from "../../services/seeded-lodash";

// TODO: make this one preserve the classes proportions of whole set
export const trainTestSplit: typeof tools.trainTestSplit = <
  T extends ProblemType
>(
  dataset: DataSet<T>,
  trainPercent: number,
  seed: number
): {
  trainSet: DataSet<T>;
  testSet: DataSet<T>;
} => {
  if (trainPercent < 0 || trainPercent > 1) {
    throw new Error(
      `trainTestSplit function cannot make a train set with ${trainPercent} of all samples. Must be between 0 and 1`
    );
  }

  const N = dataset.rows.length;
  const trainSize = Math.floor(trainPercent * N);

  const seededLodashProvider = new SeededLodashProvider();
  seededLodashProvider.setSeed(seed);
  const lo = seededLodashProvider.getSeededLodash();

  const allIdx = lo.shuffle(lo.range(N));
  const trainIdx = allIdx.slice(0, trainSize);
  const testIdx = allIdx.slice(trainSize);

  const trainSet = { ...dataset };
  trainSet.rows = trainSet.rows.filter((r, i) => trainIdx.includes(i));

  const testSet = { ...dataset };
  testSet.rows = testSet.rows.filter((r, i) => testIdx.includes(i));

  seededLodashProvider.resetSeed();

  return {
    trainSet,
    testSet,
  };
};
