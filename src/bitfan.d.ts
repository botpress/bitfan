export function runSolution(solution: Solution): void;

export type Solution = {
  problems: (
    | Problem<"misunderstood">
    | Problem<"context">
    | Problem<"intent">
    | Problem<"slot">
    | Problem<"spell">
    | Problem<"lang">
  )[];
  seeds: number[];
} & AtLeastOne<{
  misunderstoodEngine: Engine<"misunderstood">;
  contextEngine: Engine<"context">;
  intentEngine: Engine<"intent">;
  slotEngine: Engine<"slot">;
  spellEngine: Engine<"spell">;
  langEngine: Engine<"lang">;
}>;

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

export namespace engines {
  export class BpMisunderstoodEngine implements Engine<"misunderstood"> {
    constructor(endpoint: string, password: string);
    train: (input: DataSet<"misunderstood">, seed: number) => void;
    predict: (text: string, lang: string) => Prediction<"misunderstood">;
  }

  export class BpContextEngine implements Engine<"context"> {
    constructor(endpoint: string, password: string);
    train: (input: DataSet<"context">, seed: number) => void;
    predict: (text: string, lang: string) => Prediction<"context">;
  }

  export class BpIntentEngine implements Engine<"intent"> {
    constructor(endpoint: string, password: string);
    train: (input: DataSet<"intent">, seed: number) => void;
    predict: (text: string, lang: string) => Prediction<"intent">;
  }

  export class BpSlotEngine implements Engine<"slot"> {
    constructor(endpoint: string, password: string);
    train: (input: DataSet<"slot">, seed: number) => void;
    predict: (text: string, lang: string) => Prediction<"slot">;
  }
}

export namespace metrics {
  export const binaryIntentScore: ScoreFunction<"intent">;
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
  scoreFunctions: ScoreFunction<T>[]; // threshold and elections are contained in these score-functions
  visualisationFunction: VisualisationFunction<T>;
}

export interface Engine<T extends ProblemType> {
  train: (input: DataSet<T>, seed: number) => void;
  predict: (text: string, lang: string) => Prediction<T>;
}

export type ScoreFunction<T extends ProblemType> = (
  text: string,
  prediction: Prediction<T>,
  label: Label<T>
) => number;

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
