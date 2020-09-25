export function runSolution<T extends ProblemType>(
  solutions: Solution<T>,
  seeds: number[]
): void;

export type Solution<T extends ProblemType> = {
  problems: Problem<T>[];
  engine: Engine<T>;
};

export namespace datasets {
  export const bpdsRegressionA_train: DataSet<"intent-oos">;
  export const bpdsRegressionA_test: DataSet<"intent-oos">;
  export const bpdsRegressionB_train: DataSet<"intent-oos">;
  export const bpdsRegressionB_test: DataSet<"intent-oos">;
  export const bpdsRegressionC_train: DataSet<"intent-oos">;
  export const bpdsRegressionC_test: DataSet<"intent-oos">;
  export const bpdsRegressionD_train: DataSet<"intent-oos">;
  export const bpdsRegressionD_test: DataSet<"intent-oos">;
  export const bpdsRegressionE_train: DataSet<"intent-oos">;
  export const bpdsRegressionE_test: DataSet<"intent-oos">;
  export const bpdsRegressionF_train: DataSet<"intent-oos">;
  export const bpdsRegressionF_test: DataSet<"intent-oos">;
}

export namespace metrics {
  export const binaryIntentScore: Metric<"intent">;
  export const binaryIntentOOSScore: Metric<"intent-oos">;
}

export namespace tools {
  export const trainTestSplit: <T extends ProblemType>(
    dataset: DataSet<T>,
    trainPercent: number,
    seed: number
  ) => {
    trainSet: DataSet<T>;
    testSet: DataSet<T>;
  };
}

export type ProblemType =
  | "oos"
  | "context"
  | "context-oos"
  | "intent"
  | "intent-oos"
  | "slot"
  | "lang"
  | "spell";

type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
  U[keyof U];

type Dic<T> = {
  [key: string]: T;
};

type DicWithOOS<T> = Dic<T> & {
  "oo-scope": number;
};

type OOSLabel = "oo-scope";
export type Label<T extends ProblemType> = T extends "oos"
  ? "in-scope" | OOSLabel
  : T extends "context"
  ? string
  : T extends "intent"
  ? string[]
  : T extends "intent-oos"
  ? string[] | OOSLabel
  : T extends "context-oos"
  ? string | OOSLabel
  : T extends "slot"
  ? { name: string; start: number; end: number }
  : string;

export type Prediction<T extends ProblemType> = T extends "oos"
  ? Dic<number>
  : T extends "context"
  ? Dic<number>
  : T extends "intent"
  ? Dic<number>
  : T extends "intent-oos"
  ? DicWithOOS<number>
  : T extends "context-oos"
  ? DicWithOOS<number>
  : T extends "slot"
  ? Dic<{ start: number; end: number; confidence: number }>
  : string;

export interface Problem<T extends ProblemType> {
  type: ProblemType;
  trainSet: DataSet<T>;
  testSet: DataSet<T>;
  lang: string;
  metrics: Metric<T>[]; // threshold and elections are contained in these score-functions
  visualisationFunction: VisualisationFunction<T>;
}

export interface Engine<T extends ProblemType> {
  train: (trainSet: DataSet<T>, seed: number) => void;
  predict: (testSet: DataSet<T>) => Result<T>[];
}

export type Metric<T extends ProblemType> = {
  name: string;
  eval(res: Result<T>): number;
};

export type Result<T extends ProblemType> = {
  text: string;
  prediction: Prediction<T>;
  label: Label<T>;
};

export type VisualisationFunction<T extends ProblemType> = (
  trainSet: DataSet<T>,
  testSet: DataSet<T>,
  results: Result<T>[]
) => void;

export interface DataSet<T extends ProblemType> {
  type: T;
  lang: string;
  rows: Row<T>[];
}

interface Row<T extends ProblemType> {
  text: string;
  label: Label<T>;
}
