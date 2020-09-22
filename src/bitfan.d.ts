import {
  AtLeastOne,
  BaseProblem,
  BaseResult,
  BaseDataSet,
  BaseRow,
  BaseEngine,
} from "./base.d";

export function registerDataSet(set: Dataset): void;
export function registerProblem(problem: Problem): void;
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

export namespace engines {
  export const bpMisunderstoodEngine: MisunderstoodEngine;
  export const bpContextEngine: ContextEngine;
  export const bpIntentEngine: IntentEngine;
  export const bpSlotEngine: SlotEngine;
}

export namespace metrics {
  export const binaryIntentScore: IntentScoreFunc;
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
interface MisunderstoodDataSet extends BaseDataSet {
  type: "misunderstood";
  rows: MisunderstoodRow[];
}

type MisunderstoodLabel = boolean; // misunderstood or not

interface MisunderstoodRow extends BaseRow {
  label: MisunderstoodLabel;
}

interface MisunderstoodPrediction {
  [ctx: string]: number;
}

interface MisunderstoodResult extends BaseResult {
  text: string;
  prediction: MisunderstoodPrediction;
  label: MisunderstoodLabel;
}

type MisunderstoodVisFunc = (
  trainSet: MisunderstoodDataSet,
  testSet: MisunderstoodDataSet,
  results: MisunderstoodResult[]
) => void;

type MisunderstoodScoreFunc = (result: MisunderstoodResult) => number;

interface MisunderstoodProblem extends BaseProblem {
  type: "misunderstood";
  trainSet: MisunderstoodDataSet;
  testSet: MisunderstoodDataSet;
  scoreFunctions: MisunderstoodScoreFunc[];
  visualisationFunction: MisunderstoodVisFunc;
}

type MisunderstoodEngine = BaseEngine<
  MisunderstoodDataSet,
  MisunderstoodPrediction
>;

// #############
// ## context ##
// #############
interface ContextDataSet extends BaseDataSet {
  type: "context";
  rows: ContextRow[];
}

type ContextLabel = string;

interface ContextRow extends BaseRow {
  label: ContextLabel;
}

type ContextPrediction = {
  [ctx: string]: number;
};

interface ContextResult extends BaseResult {
  text: string;
  prediction: ContextPrediction;
  label: ContextLabel;
}

type ContextVisFunc = (
  trainSet: ContextDataSet,
  testSet: ContextDataSet,
  results: ContextResult[]
) => void;

type ContextScoreFunc = (result: ContextResult) => number;

interface ContextProblem extends BaseProblem {
  type: "context";
  trainSet: ContextDataSet;
  testSet: ContextDataSet;
  scoreFunctions: ContextScoreFunc[];
  visualisationFunction: ContextVisFunc;
}

type ContextEngine = BaseEngine<ContextDataSet, ContextPrediction>;

// #############
// ## intents ##
// #############
interface IntentDataSet extends BaseDataSet {
  type: "intent";
  rows: IntentRow[];
}

type IntentLabel = string[];

interface IntentRow extends BaseRow {
  label: IntentLabel;
}

interface IntentPrediction {
  [intent: string]: number;
}

interface IntentResult extends BaseResult {
  text: string;
  prediction: IntentPrediction;
  label: IntentLabel;
}

type IntentVisFunc = (
  trainSet: IntentDataSet,
  testSet: IntentDataSet,
  results: IntentResult[]
) => void;

type IntentScoreFunc = (result: IntentResult) => number;

interface IntentProblem extends BaseProblem {
  type: "intent";
  trainSet: IntentDataSet;
  testSet: IntentDataSet;
  scoreFunctions: IntentScoreFunc[];
  visualisationFunction: IntentVisFunc;
}

type IntentEngine = BaseEngine<IntentDataSet, IntentPrediction>;

// ###########
// ## slots ##
// ###########
interface SlotDataSet extends BaseDataSet {
  type: "slot";
  rows: SlotRow[];
}

type SlotLabel = { start: number; end: number; name: string }[];

interface SlotRow extends BaseRow {
  label: SlotLabel;
}

interface SlotPrediction {
  [slot: string]: { start: number; end: number; confidence: number };
}

interface SlotResult extends BaseResult {
  text: string;
  DataSet: SlotDataSet;
  prediction: SlotPrediction;
  label: SlotLabel;
}

type SlotVisFunc = (
  trainSet: SlotDataSet,
  testSet: SlotDataSet,
  results: SlotResult[]
) => void;

type SlotScoreFunc = (result: SlotResult) => number;

interface SlotProblem extends BaseProblem {
  type: "slot";
  trainSet: SlotDataSet;
  testSet: SlotDataSet;
  scoreFunctions: SlotScoreFunc[];
  visualisationFunction: SlotVisFunc;
}

type SlotEngine = BaseEngine<SlotDataSet, SlotPrediction>;
