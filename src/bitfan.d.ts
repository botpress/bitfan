export function runSolution<T extends ProblemType>(
  solution: Solution<T>,
  seeds: number[]
): Promise<Result<T>[]>;

export type Solution<T extends ProblemType> = {
  name: string;
  problems: Problem<T>[];
  engine: Engine<T>;
  metrics: Metric<T>[]; // threshold and elections are contained in these score-functions
  cb?: ResultsCb<T>;
};

export namespace datasets {
  export namespace bpds {
    export namespace intents {
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

    export namespace slots {
      export namespace test {
        const A: DataSet<"slot">;
        const B: DataSet<"slot">;
        const C: DataSet<"slot">;
        const D: DataSet<"slot">;
        const E: DataSet<"slot">;
        const F: DataSet<"slot">;
        const G: DataSet<"slot">;
        const H: DataSet<"slot">;
        const I: DataSet<"slot">;
        const J: DataSet<"slot">;
      }

      export namespace train {
        const A: DataSet<"slot">;
        const B: DataSet<"slot">;
        const C: DataSet<"slot">;
        const D: DataSet<"slot">;
        const E: DataSet<"slot">;
        const F: DataSet<"slot">;
        const G: DataSet<"slot">;
        const H: DataSet<"slot">;
        const I: DataSet<"slot">;
        const J: DataSet<"slot">;
      }
    }
  }

  export namespace covid {
    const en: DataSet<"intent">;
    const fr: DataSet<"intent">;
  }
}

export namespace metrics {
  export const mostConfidentBinaryScore: Metric<SingleLabel>;
  export const oosBinaryScore: Metric<SingleLabel>;
  export const topicBinaryScore: Metric<"intent-topic">;
  export const slotBinaryScore: Metric<"slot">;
  export const slotScore: Metric<"slot">;
  export const slotCount: Metric<"slot">;
}

type AggregationOption = {
  aggregateBy: "seed" | "problem" | "all";
};

export namespace visualisation {
  export const showOOSConfusion: ResultsCb<SingleLabel>;
  export const showSlotsResults: ResultsCb<"slot">;
  export const showAverageScoreByMetric: <T extends ProblemType>(
    metrics: Metric<T>[],
    options?: Partial<AggregationOption>
  ) => ResultsCb<T>;

  export const showClassDistribution: <T extends ProblemType>(
    ...datasets: (DataSet<T> & { name: string })[]
  ) => void;

  export const showDatasetsSummary: <T extends ProblemType>(
    ...datasets: (DataSet<T> & { name: string })[]
  ) => void;
}

export namespace engines {
  export class BpIntentEngine implements Engine<"intent"> {
    constructor(bpEndpoint?: string, password?: string);
    train: (
      trainSet: DataSet<"intent">,
      seed: number,
      progress: ProgressCb
    ) => Promise<void>;
    predict: (
      testSet: DataSet<"intent">,
      progress: ProgressCb
    ) => Promise<PredictOutput<"intent">[]>;
  }

  export class BpIntentTopicEngine implements Engine<"intent-topic"> {
    constructor(bpEndpoint?: string, password?: string);
    train: (
      trainSet: DataSet<"intent-topic">,
      seed: number,
      progress: ProgressCb
    ) => Promise<void>;
    predict: (
      testSet: DataSet<"intent-topic">,
      progress: ProgressCb
    ) => Promise<PredictOutput<"intent-topic">[]>;
  }

  export class BpTopicEngine implements Engine<"topic"> {
    constructor(bpEndpoint?: string, password?: string);
    train: (
      trainSet: DataSet<"topic">,
      seed: number,
      progress: ProgressCb
    ) => Promise<void>;
    predict: (
      testSet: DataSet<"topic">,
      progress: ProgressCb
    ) => Promise<PredictOutput<"topic">[]>;
  }

  export class BpSlotEngine implements Engine<"slot"> {
    constructor(bpEndpoint?: string, password?: string);
    train: (
      trainSet: DataSet<"slot">,
      seed: number,
      progress: ProgressCb
    ) => Promise<void>;
    predict: (
      testSet: DataSet<"slot">,
      progress: ProgressCb
    ) => Promise<PredictOutput<"slot">[]>;
  }
}

export namespace tools {
  export const trainTestSplit: <T extends ProblemType>(
    dataset: DataSet<T>,
    trainPercent: number,
    seed: number,
    options?: { stratificate: boolean }
  ) => {
    trainSet: DataSet<T>;
    testSet: DataSet<T>;
  };

  export const pickOOS: <T extends SingleLabel>(
    dataset: DataSet<T>,
    oosPercent: number,
    seed: number
  ) => Label<T>[];

  export const splitOOS: <T extends SingleLabel>(
    dataset: DataSet<T>,
    labels: Label<T>[]
  ) => { inScopeSet: DataSet<T>; ooScopeSet: DataSet<T> };
}

export namespace labels {
  export function areSame<T extends ProblemType>(
    label1: Label<T>,
    label2: Label<T>
  ): boolean;

  export function isOOS<T extends ProblemType>(label: Label<T>): boolean;

  export function makeKey<T extends ProblemType>(label: Label<T>): string;
}

// export type AtLeastOne<T> = { [K in keyof T]: Pick<T, K> }[keyof T];

export type SingleLabel = "intent" | "topic" | "intent-topic"; // label of an "intent-topic" problem is "topic/intent"
export type MultiLabel = "multi-intent" | "multi-intent-topic";
export type ProblemType = SingleLabel | MultiLabel | "slot" | "lang" | "spell";

type Dic<T> = {
  [key: string]: T;
};

export type Label<T extends ProblemType> = T extends SingleLabel
  ? string
  : T extends MultiLabel
  ? string[]
  : T extends "slot"
  ? { name: string; start: number; end: number }[]
  : string;

export type Understanding<T extends ProblemType> = T extends SingleLabel
  ? Dic<number>
  : T extends MultiLabel
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

export type ProgressCb = (p: number) => void;

export interface Engine<T extends ProblemType> {
  train: (
    trainSet: DataSet<T>,
    seed: number,
    progress: ProgressCb
  ) => Promise<void>;
  predict: (
    testSet: DataSet<T>,
    progress: ProgressCb
  ) => Promise<PredictOutput<T>[]>;
}

export type PredictOutput<T extends ProblemType> = {
  text: string;
  prediction: Understanding<T>;
  label: Label<T>;
};

export type Metric<T extends ProblemType> = {
  name: string;
  eval(res: PredictOutput<T>): number;
};

export type Result<T extends ProblemType> = PredictOutput<T> & {
  scores: {
    [metric: string]: number;
  };
  metadata: {
    seed: number;
    problem: string;
  };
};

export type ResultsCb<T extends ProblemType> = (
  results: Result<T>[]
) => Promise<void>;

export type DataSet<T extends ProblemType> = {
  type: T;
  lang: string;
  rows: Row<T>[];
} & (T extends "slot"
  ? { variables?: Variable[]; patterns?: Pattern[]; enums?: Enum[] }
  : {});

type Variable = {
  name: string;
  types: string[];
};

interface Enum {
  name: string;
  values: { name: string; synonyms: string[] }[];
  fuzzy: number;
}

interface Pattern {
  name: string;
  regex: string;
  case_sensitive: boolean;
}

interface Row<T extends ProblemType> {
  text: string;
  label: Label<T>;
}
