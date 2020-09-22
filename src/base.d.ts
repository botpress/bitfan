export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
  U[keyof U];

export type ProblemType = "misunderstood" | "context" | "intent" | "slot";

export interface BaseProblem {
  name: string;
  type: ProblemType;
  trainSet: BaseDataSet;
  testSet: BaseDataSet;
  lang: string;
  scoreFunctions: Function[]; // threshold and elections are contained in these score-functions
  visualisationFunction: Function;
}

export interface BaseResult {
  text: string;
  prediction: any;
  label: any;
}

export interface BaseDataSet {
  name: string;
  type: ProblemType;
  rows: BaseRow[];
}

export interface BaseRow {
  text: string;
  label: any;
}

export interface BaseEngine<DS, Pred> {
  id: string;
  train: (input: DS, seed: number) => void;
  predict: (text: string, lang: string) => Pred;
}
