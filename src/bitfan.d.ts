export function runSolution<T extends ProblemType>(
  solution: Solution<T>,
  seeds: number[]
): Promise<Result<T>[]>;

export function evaluateMetrics<T extends ProblemType>(
  results: Result<T>[],
  metrics: Metric<T>[],
  options?: Partial<ReportOptions>
): PerformanceReport;

export function comparePerformances(
  currentPerformance: PerformanceReport,
  previousPerformance: PerformanceReport,
  options?: Partial<CompareOptions>
): ComparisonReport;

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
}

export namespace criterias {
  /**
   * @description Most basic criteria.
   * @returns 1 if most confident label is the expected one and 0 else
   */
  export const labelIs: Criteria<SingleLabel>;
  export const labelHasTopic: Criteria<"intent-topic">;

  export const slotsAre: Criteria<"slot">;
  export const slotIncludes: Criteria<"slot">;
  export const slotCountIs: Criteria<"slot">;
}

export namespace metrics {
  export const averageScore: <T extends ProblemType>(
    criteria: Criteria<T>
  ) => Metric<T>;

  /**
   * @description Equivalent to computing average score with criteria "labelIs"
   * @returns Accuracy of correctly identified labels, using the most confident as the elected one
   */
  export const accuracy: Metric<SingleLabel>;

  /**
   * @description Accuracy metrics computed only on in-scope samples. Elects most confident label, but ignore OOS.
   */
  export const inScopeAccuracy: Metric<SingleLabel>;
  export const oosAccuracy: Metric<SingleLabel>;
  export const oosPrecision: Metric<SingleLabel>;
  export const oosRecall: Metric<SingleLabel>;
  export const oosF1: Metric<SingleLabel>;
}

export namespace visualisation {
  export const showOOSConfusion: ResultViewer<SingleLabel>;
  export const showSlotsResults: ResultViewer<"slot">;

  export const showClassDistribution: DatasetViewer<SingleLabel>;
  export const showDatasetsSummary: DatasetViewer<ProblemType>;

  export const showReport: (report: PerformanceReport) => Promise<void>;
}

export namespace engines {
  export const makeBpIntentEngine: (
    bpEndpoint: string,
    password: string,
    opt?: Partial<BpEngineOptions>
  ) => Engine<"intent">;
  export const makeBpIntentTopicEngine: (
    bpEndpoint: string,
    password: string,
    opt?: Partial<BpEngineOptions>
  ) => Engine<"intent-topic">;
  export const makeBpTopicEngine: (
    bpEndpoint: string,
    password: string,
    opt?: Partial<BpEngineOptions>
  ) => Engine<"topic">;
  export const makeBpSlotEngine: (
    bpEndpoint: string,
    password: string,
    opt?: Partial<BpEngineOptions>
  ) => Engine<"slot">;
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

  export const subSample: <T extends ProblemType>(
    dataset: DataSet<T>,
    percent: number,
    seed: number,
    options?: { stratificate: boolean }
  ) => DataSet<T>;

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

/**
 * @description Collection of problems with an engine to solve them
 */
export type Solution<T extends ProblemType> = {
  name: string;
  problems: Problem<T>[];
  engine: Engine<T>;
  cb?: ResultViewer<T>;
};

export type SingleLabel =
  | "intent"
  | "topic"
  | "intent-topic" // label of an "intent-topic" problem is "topic/intent"
  | "lang"
  | "spell";
export type MultiLabel = "multi-intent" | "multi-intent-topic";

/**
 * @name ProblemType
 * @description All solvable problem types
 */
export type ProblemType = SingleLabel | MultiLabel | "slot";

type Dic<T> = {
  [key: string]: T;
};

/**
 * @description Format of a label for a given problem type.
 *  For intent problems, its only a string, but for slots, it contains more information
 */
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

/**
 * @description Collection of one train dataset and one test dataset
 */
export interface Problem<T extends ProblemType> {
  name: string;
  type: ProblemType;
  trainSet: DataSet<T>;
  testSet: DataSet<T>;
  lang: string;
  cb?: ResultViewer<T>;
}

export type ProgressCb = (p: number) => void;

export interface BpEngineOptions {
  modelId: string; // allows to skip training and do predictions with given modelId
}

/**
 * @description Collection of a train function and a predict function
 */
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

/**
 * @description Function that decides weither or not a test should pass or fail.
 * @returns A number between 0 and 1 where 0 means that the test has failed.
 * For multi-class problems, this number will often be, neither 1 or 0, but a fraction.
 */
export type Criteria<T extends ProblemType> = {
  name: string;
  eval(res: PredictOutput<T>): number;
};

export type Result<T extends ProblemType> = PredictOutput<T> & {
  metadata: {
    seed: number;
    problem: string;
  };
};

export type AggregateOptions = "seed" | "problem" | "all";
export type ReportOptions = {
  groupBy: AggregateOptions;
};

export type ResultViewer<T extends ProblemType, O extends Object = {}> = (
  results: Result<T>[],
  options?: Partial<O>
) => Promise<void>;

export type DatasetViewer<T extends ProblemType> = (
  ...datasets: DataSet<T>[]
) => void;

export type ScoreInfo = {
  metric: string;
  group: string;
  score: number;
};

export type PerformanceReport = {
  generatedOn: Date;
  groupedBy: AggregateOptions;
  scores: ScoreInfo[];
};

export type RegressionStatus =
  | "success"
  | "regression"
  | "tolerated-regression";

export type RegressionReason = {
  metric: string;
  group: string;
  currentScore: number;
  previousScore: number;
  allowedRegression: number;
};

export type ComparisonReport = {
  status: RegressionStatus;
  reasons: RegressionReason[];
};

export type CompareOptions = {
  toleranceByMetric: Dic<number>;
};

/**
 * @description Function that compute a performance score given the whole results.
 * @returns A performance score between 0 and 1.
 */
export type Metric<T extends ProblemType> = {
  name: string;
  eval: (results: PredictOutput<T>[]) => number;
};

export type DataSet<T extends ProblemType> = {
  name: string;
  type: T;
  lang: string;
  samples: Sample<T>[];
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

interface Sample<T extends ProblemType> {
  text: string;
  label: Label<T>;
}
