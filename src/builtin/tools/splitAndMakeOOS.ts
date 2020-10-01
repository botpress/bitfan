import { DataSet, ProblemType } from "bitfan/sdk";

type Count = { count: number };
type Labels = { labels: string[] };

const DEFAULT_OPTIONS: Count = {
  count: 1,
};

export const splitAndMakeOOS = <T extends ProblemType>(
  dataset: DataSet<T>,
  seed: number,
  options?: Count | Labels
) => {
  options = options ?? DEFAULT_OPTIONS;
  if (_isLabels(options)) {
    return _splitAndMakeOOSFromLabels(dataset, seed, options.labels);
  }
  return _splitAndMakeOOSRandomly(dataset, seed, options.count);
};

const _splitAndMakeOOSFromLabels = <T extends ProblemType>(
  dataset: DataSet<T>,
  seed: number,
  labels: string[]
) => {
  return { trainSet: {} as DataSet<T>, testSet: {} as DataSet<T> };
};

const _splitAndMakeOOSRandomly = <T extends ProblemType>(
  dataset: DataSet<T>,
  seed: number,
  count: number
) => {
  return { trainSet: {} as DataSet<T>, testSet: {} as DataSet<T> };
};

const _isLabels = (options: Labels | Count): options is Labels => {
  return !!(options as Labels).labels;
};
