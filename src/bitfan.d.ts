export function runSolution<T extends ProblemType>(
  solution: Solution<T>,
  seed: number
): Promise<void>;

export type Solution<T extends ProblemType> = {
  problems: Problem<T>[];
  engine: Engine<T>;
  metrics: Metric<T>[]; // threshold and elections are contained in these score-functions
};

export namespace datasets {
  export namespace bpds {
    export namespace regression {
      export namespace test {
        const A: DataSet<"intent">;
        const B: DataSet<"intent">;
        const C: DataSet<"intent">;
        const D: DataSet<"intent">;
        const E: DataSet<"intent">;
        const F: DataSet<"intent">;
      }

      export namespace train {
        const A: DataSet<"intent">;
        const B: DataSet<"intent">;
        const C: DataSet<"intent">;
        const D: DataSet<"intent">;
        const E: DataSet<"intent">;
        const F: DataSet<"intent">;
      }
    }
  }
}

export namespace metrics {
  export const binaryIntentScore: Metric<"intent">;
}

export namespace engines {
  export class BpIntentEngine implements Engine<"intent"> {
    constructor(bpEndpoint?: string, password?: string);
    train: (trainSet: DataSet<"intent">, seed: number) => Promise<void>;
    predict: (testSet: DataSet<"intent">) => Promise<Result<"intent">[]>;
  }
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
  | "intent-topic"
  | "topic"
  | "intent"
  | "slot"
  | "lang"
  | "spell";

type Dic<T> = {
  [key: string]: T;
};

export type Label<T extends ProblemType> = T extends "topic"
  ? string[]
  : T extends "intent"
  ? string[]
  : T extends "slot"
  ? { name: string; start: number; end: number }
  : string;

export type Prediction<T extends ProblemType> = T extends "topic"
  ? Dic<number>
  : T extends "intent"
  ? Dic<number>
  : T extends "slot"
  ? Dic<{ start: number; end: number; confidence: number }>
  : string;

export interface Problem<T extends ProblemType> {
  name: string;
  type: ProblemType;
  trainSet: DataSet<T>;
  testSet: DataSet<T>;
  lang: string;
  cb: ProblemCb<T>;
}

export interface Engine<T extends ProblemType> {
  train: (trainSet: DataSet<T>, seed: number) => Promise<void>;
  predict: (testSet: DataSet<T>) => Promise<Result<T>[]>;
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

export type ProblemCb<T extends ProblemType> = (
  results: Result<T>[],
  metrics: {
    [name: string]: number;
  }
) => Promise<void>;

export interface DataSet<T extends ProblemType> {
  type: T;
  lang: string;
  rows: Row<T>[];
}

interface Row<T extends ProblemType> {
  text: string;
  label: Label<T>;
}
