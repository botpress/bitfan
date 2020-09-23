export function runSolution<T extends ProblemType>(
  solutions: Solution<T>,
  seeds: number[]
): void;

export type Solution<T extends ProblemType> = {
  problems: Problem<T>[];
  engine: Engine<T>;
};

export namespace datasets {
  export const bpdsRegressionA: DataSet<"intent">;
  export const bpdsRegressionB: DataSet<"intent">;
  export const bpdsRegressionC: DataSet<"intent">;
  export const bpdsRegressionD: DataSet<"intent">;
  export const bpdsRegressionE: DataSet<"intent">;
  export const bpdsRegressionF: DataSet<"intent">;

  export const bpdsSlotA: DataSet<"slot">;
  export const bpdsSlotB: DataSet<"slot">;
  export const bpdsSlotC: DataSet<"slot">;
  export const bpdsSlotD: DataSet<"slot">;
  export const bpdsSlotE: DataSet<"slot">;
  export const bpdsSlotF: DataSet<"slot">;
  export const bpdsSlotG: DataSet<"slot">;
  export const bpdsSlotH: DataSet<"slot">;
  export const bpdsSlotI: DataSet<"slot">;
  export const bpdsSlotJ: DataSet<"slot">;
}

export namespace metrics {
  export const binaryIntentScore: Metric<"intent">;
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
  | "misunderstood"
  | "context"
  | "intent"
  | "slot"
  | "lang"
  | "spell";

type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
  U[keyof U];

type Dic<T> = {
  [key: string]: T;
};

export type Label<T extends ProblemType> = T extends "misunderstood"
  ? boolean
  : T extends "context"
  ? string
  : T extends "intent"
  ? string[]
  : T extends "slot"
  ? { name: string; start: number; end: number }
  : string;

export type Prediction<T extends ProblemType> = T extends "misunderstood"
  ? Dic<number>
  : T extends "context"
  ? Dic<number>
  : T extends "intent"
  ? Dic<number>
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
