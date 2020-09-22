type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
  U[keyof U];

type ProblemType = "misunderstood" | "context" | "intent" | "slot";

type BaseProblem = {
  name: string;
  type: ProblemType;
  trainSet: BaseDataSet;
  testSet: BaseDataSet;
  lang: string;
  scoreFunctions: BaseScoreFunc[]; // threshold and elections are contained in these score-functions
  visualisationFunction: BaseVisFunc;
};

type BaseResult = {
  text: string;
  prediction: any;
  label: any;
};

type BaseScoreFunc = (result: BaseResult) => number; // number between 0 and 1

type BaseVisFunc = (
  trainSet: BaseDataSet,
  testSet: BaseDataSet,
  results: BaseResult[]
) => void;

type BaseDataSet = {
  name: string;
  type: ProblemType;
  rows: BaseRow[];
};

type BaseRow = {
  text: string;
  label: any;
};

type BaseEngine = {
  id: string;
  train: (input: BaseDataSet, seed: number) => void;
  predict: (text: string, lang: string) => any;
};
