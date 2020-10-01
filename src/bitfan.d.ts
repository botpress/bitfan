export function runSolution<T extends ProblemType>(
  solution: Solution<T>,
  seed: number
): Promise<void>;

export function areSame<T extends ProblemType>(
  label1: Label<T>,
  label2: Label<T>
): boolean;

export function isOOS<T extends ProblemType>(label: Label<T>): boolean;

export type Solution<T extends ProblemType> = {
  name: string;
  problems: Problem<T>[];
  engine: Engine<T>;
  metrics: Metric<T>[]; // threshold and elections are contained in these score-functions
  cb?: ResultsCb<T>;
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

  export namespace covid {
    const en: DataSet<"intent">;
    const fr: DataSet<"intent">;
  }
}

export namespace metrics {
  export const mostConfidentBinaryScore: Metric<"intent"> & Metric<"topic">;
  export const oosBinaryScore: Metric<"intent"> & Metric<"topic">;
}

export namespace visualisation {
  export const showOOSConfusion: ResultsCb<"intent"> & ResultsCb<"topic">;
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

  export const splitAndMakeOOS: <T extends IntentOrTopic>(
    dataset: DataSet<T>,
    trainPercent: number,
    seed: number,
    options?: { count: number } | { labels: string[] }
  ) => {
    trainSet: DataSet<T>;
    testSet: DataSet<T>;
  };
}

// export type AtLeastOne<T> = { [K in keyof T]: Pick<T, K> }[keyof T];

export type IntentOrTopic = "intent" | "topic";
export type ProblemType =
  | IntentOrTopic
  | "intent-topic"
  | "multi-intent"
  | "slot"
  | "lang"
  | "spell";

type Dic<T> = {
  [key: string]: T;
};

export type Label<T extends ProblemType> = T extends "intent-topic"
  ? { intent: string; topic: string }
  : T extends "multi-intent"
  ? string[]
  : T extends "topic"
  ? string // single intent for now
  : T extends "intent"
  ? string
  : T extends "slot"
  ? { name: string; start: number; end: number }[]
  : string;

export type Prediction<T extends ProblemType> = T extends "intent-topic"
  ? Dic<Dic<number>> // confidence for each intent of each topic
  : T extends "topic"
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
  cb?: ResultsCb<T>;
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

export type ResultsCb<T extends ProblemType> = (
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
