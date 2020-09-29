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
        const A: DataSet<"intent-oos">;
        const B: DataSet<"intent-oos">;
        const C: DataSet<"intent-oos">;
        const D: DataSet<"intent-oos">;
        const E: DataSet<"intent-oos">;
        const F: DataSet<"intent-oos">;
      }

      export namespace train {
        const A: DataSet<"intent-oos">;
        const B: DataSet<"intent-oos">;
        const C: DataSet<"intent-oos">;
        const D: DataSet<"intent-oos">;
        const E: DataSet<"intent-oos">;
        const F: DataSet<"intent-oos">;
      }
    }
  }
}

export namespace metrics {
  export const binaryIntentScore: Metric<"intent"> & Metric<"intent-oos">;
}

export namespace engines {
  export class BpIntentOOSEngine implements Engine<"intent-oos"> {
    constructor(bpEndpoint?: string, password?: string);
    train: (trainSet: DataSet<"intent-oos">, seed: number) => Promise<void>;
    predict: (
      testSet: DataSet<"intent-oos">
    ) => Promise<Result<"intent-oos">[]>;
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

type DicWithOOS<T> = Dic<T> & Record<OOSLabel, number>;

type OOSLabel = "oo-scope";
type INSLabel = "in-scope";

export type Label<T extends ProblemType> = T extends "oos"
  ? INSLabel | OOSLabel
  : T extends "context"
  ? string
  : T extends "intent"
  ? string[]
  : T extends "intent-oos"
  ? string[] | [OOSLabel]
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
