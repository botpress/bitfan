export function registerDataSet(set: MisunderstoodDataSet): void;
export function registerDataSet(set: ContextDataSet): void;
export function registerDataSet(set: IntentDataSet): void;
export function registerDataSet(set: SlotDataSet): void;

export function registerProblem(problem: MisunderstoodProblem): void;
export function registerProblem(problem: ContextProblem): void;
export function registerProblem(problem: IntentProblem): void;
export function registerProblem(problem: SlotProblem): void;

export function runSolution(solution: Solution): void;

type Solution = {
  name: string;
  problems: Problem[];
  seeds: number[];
} & AtLeastOne<{
  misunderstoodEngine: MisunderstoodEngine;
  contextEngine: ContextEngine;
  intentEngine: IntentEngine;
  slotEngine: SlotEngine;
}>;

export namespace datasets {
  export const bpdsRegressionA: IntentDataSet;
  export const bpdsRegressionB: IntentDataSet;
  export const bpdsRegressionC: IntentDataSet;
  export const bpdsRegressionD: IntentDataSet;
  export const bpdsRegressionE: IntentDataSet;
  export const bpdsRegressionF: IntentDataSet;

  export const bpdsSlotA: SlotDataSet;
  export const bpdsSlotB: SlotDataSet;
  export const bpdsSlotC: SlotDataSet;
  export const bpdsSlotD: SlotDataSet;
  export const bpdsSlotE: SlotDataSet;
  export const bpdsSlotF: SlotDataSet;
  export const bpdsSlotG: SlotDataSet;
  export const bpdsSlotH: SlotDataSet;
  export const bpdsSlotI: SlotDataSet;
  export const bpdsSlotJ: SlotDataSet;
}

type Problem =
  | MisunderstoodProblem
  | ContextProblem
  | IntentProblem
  | SlotProblem;

type Dataset =
  | MisunderstoodDataSet
  | ContextDataSet
  | IntentDataSet
  | SlotDataSet;

// ###################
// ## misunderstood ##
// ###################
type MisunderstoodDataSet = BaseDataSet & {
  type: "misunderstood";
  rows: MisunderstoodRow[];
};

type MisunderstoodLabel = boolean; // misunderstood or not

type MisunderstoodRow = BaseRow & {
  label: MisunderstoodLabel;
};

type MisunderstoodPrediction = {
  [ctx: string]: number;
};

type MisunderstoodResult = BaseResult & {
  text: string;
  prediction: MisunderstoodPrediction;
  label: MisunderstoodLabel;
};

type MisunderstoodVisFunc = (
  trainSet: BaseDataSet,
  DataSet: MisunderstoodDataSet,
  results: MisunderstoodResult[]
) => void;

type MisunderstoodScoreFunc = (result: MisunderstoodResult) => number;

type MisunderstoodProblem = BaseProblem & {
  type: "misunderstood";
  DataSet: MisunderstoodDataSet;
  scoreFunctions: MisunderstoodScoreFunc[];
  visualisationFunction: MisunderstoodVisFunc;
};

type MisunderstoodEngine = BaseEngine & {
  train: (input: MisunderstoodDataSet, seed: number) => void;
  predict: (text: string, lang: string) => MisunderstoodPrediction;
};

// #############
// ## context ##
// #############
type ContextDataSet = BaseDataSet & {
  type: "context";
  rows: ContextRow[];
};

type ContextLabel = string;

type ContextRow = BaseRow & {
  label: ContextLabel;
};

type ContextPrediction = {
  [ctx: string]: number;
};

type ContextResult = BaseResult & {
  text: string;
  prediction: ContextPrediction;
  label: ContextLabel;
};

type ContextVisFunc = (
  trainSet: BaseDataSet,
  DataSet: ContextDataSet,
  results: ContextResult[]
) => void;

type ContextScoreFunc = (result: ContextResult) => number;

type ContextProblem = BaseProblem & {
  type: "context";
  DataSet: ContextDataSet;
  scoreFunctions: ContextScoreFunc[];
  visualisationFunction: ContextVisFunc;
};

type ContextEngine = BaseEngine & {
  train: (input: ContextDataSet, seed: number) => void;
  predict: (text: string, lang: string) => ContextPrediction;
};

// #############
// ## intents ##
// #############
type IntentDataSet = BaseDataSet & {
  type: "intent";
  rows: IntentRow[];
};

type IntentLabel = string[];

type IntentRow = BaseRow & {
  label: IntentLabel;
};

type IntentPrediction = {
  [intent: string]: number;
};

type IntentResult = BaseResult & {
  text: string;
  prediction: IntentPrediction;
  label: IntentLabel;
};

type IntentVisFunc = (
  trainSet: BaseDataSet,
  DataSet: IntentDataSet,
  results: IntentResult[]
) => void;

type IntentScoreFunc = (result: IntentResult) => number;

type IntentProblem = BaseProblem & {
  type: "intent";
  DataSet: IntentDataSet;
  scoreFunctions: IntentScoreFunc[];
  visualisationFunction: IntentVisFunc;
};

type IntentEngine = BaseEngine & {
  train: (input: IntentDataSet, seed: number) => void;
  predict: (text: string, lang: string) => IntentPrediction;
};

// ###########
// ## slots ##
// ###########
export type SlotDataSet = BaseDataSet & {
  type: "slot";
  rows: SlotRow[];
};

type SlotLabel = { start: number; end: number; name: string }[];

type SlotRow = BaseRow & {
  label: SlotLabel;
};

type SlotPrediction = {
  [slot: string]: { start: number; end: number; confidence: number };
};

type SlotResult = BaseResult & {
  text: string;
  DataSet: SlotDataSet;
  prediction: SlotPrediction;
  label: SlotLabel;
};

type SlotVisFunc = (
  trainSet: BaseDataSet,
  DataSet: SlotDataSet,
  results: SlotResult[]
) => void;

type SlotScoreFunc = (result: SlotResult) => number;

type SlotProblem = BaseProblem & {
  type: "slot";
  scoreFunctions: SlotScoreFunc[];
  visualisationFunction: SlotVisFunc;
};

type SlotEngine = BaseEngine & {
  train: (input: IntentDataSet, seed: number) => void;
  predict: (text: string, lang: string) => SlotPrediction;
};
