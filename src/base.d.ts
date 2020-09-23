export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
  U[keyof U];

export type ProblemType =
  | "misunderstood"
  | "context"
  | "intent"
  | "slot"
  | "lang"
  | "spell";

export interface BaseProblem<T extends ProblemType, Prediction, Label> {
  type: ProblemType;
  trainSet: DataSet<T, Label>;
  testSet: DataSet<T, Label>;
  lang: string;
  scoreFunctions: ScoreFunction<Prediction, Label>[]; // threshold and elections are contained in these score-functions
  visualisationFunction: VisualisationFunction<T, Prediction, Label>;
}

export interface Engine<T extends ProblemType, Prediction, Label> {
  train: (input: DataSet<T, Label>, seed: number) => void;
  predict: (text: string, lang: string) => Prediction;
}

export type ScoreFunction<Prediction, Label> = (
  text: string,
  prediction: Prediction,
  label: Label
) => number;

export type VisualisationFunction<T extends ProblemType, Prediction, Label> = (
  trainSet: DataSet<T, Label>,
  testSet: DataSet<T, Label>,
  results: {
    text: string;
    prediction: Prediction;
    label: Label;
  }[]
) => void;

export interface DataSet<T extends ProblemType, Label> {
  type: T;
  rows: Row<Label>[];
}

interface Row<Label> {
  text: string;
  label: Label;
}
