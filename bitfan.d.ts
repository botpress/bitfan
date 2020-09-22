// actual implemented functions
export function registerTrainSet(set: TrainSet): void;
export function registerTestSet(
  set: MisunderstoodTestSet | ContextTestSet | IntentTestSet | SlotTestSet
): void;
export function registerProblem(
  problem: MisunderstoodProblem | ContextProblem | IntentProblem | SlotProblem
): void;
export function runSolution(solution: Solution): void;

// base
type ProblemType = "misunderstood" | "context" | "intent" | "slot";

type Solution = {
  name: string;
  problems: Problem[];
  seeds: number[];
  engine: NLUEngine;
};

type Problem = {
  name: string;
  type: ProblemType;
  trainSet: TrainSet;
  testSet: TestSet;
  lang: string;
  scoreFunctions: ScoreFunc[]; // threshold and elections are contained in these score-functions
  visualisationFunction: VisFunc;
};

type Result = {
  text: string;
  prediction: any;
  label: any;
};

type ScoreFunc = (result: Result) => number; // number between 0 and 1

type VisFunc = (
  trainSet: TrainSet,
  testSet: TestSet,
  results: Result[]
) => void;

type TrainSet = {
  name: string;
}; // botpress training input

type TestSet = {
  id: string;
  type: ProblemType;
  tests: Test[];
};

type Test = {
  text: string;
  label: any;
};

type NLUEngine = {
  id: string;
  train: (input: TrainSet, seed: number) => void;
} & Partial<{
  predictMisunderstood: (text: string, lang: string) => MisunderstoodPrediction;
  predictContext: (text: string, lang: string) => ContextPrediction;
  predictIntent: (text: string, lang: string) => IntentPrediction;
  predictSlot: (text: string, lang: string) => SlotPrediction;
}>;

// ###################
// ## misunderstood ##
// ###################
type MisunderstoodTestSet = TestSet & {
  type: "misunderstood";
  tests: MisunderstoodTest[];
};

type MisunderstoodLabel = boolean;

type MisunderstoodTest = Test & {
  label: MisunderstoodLabel;
};

type MisunderstoodPrediction = {
  [ctx: string]: number;
};

type MisunderstoodResult = Result & {
  text: string;
  prediction: MisunderstoodPrediction;
  label: MisunderstoodLabel;
};

type MisunderstoodVisFunc = (
  trainSet: TrainSet,
  testSet: MisunderstoodTestSet,
  results: MisunderstoodResult[]
) => void;

type MisunderstoodScoreFunc = (result: MisunderstoodResult) => number;

type MisunderstoodProblem = Problem & {
  type: "misunderstood";
  testSet: MisunderstoodTestSet;
  scoreFunctions: MisunderstoodScoreFunc[];
  visualisationFunction: MisunderstoodVisFunc;
};

// #############
// ## context ##
// #############
type ContextTestSet = TestSet & {
  type: "context";
  tests: ContextTest[];
};

type ContextLabel = string;

type ContextTest = Test & {
  label: ContextLabel;
};

type ContextPrediction = {
  [ctx: string]: number;
};

type ContextResult = Result & {
  text: string;
  prediction: ContextPrediction;
  label: ContextLabel;
};

type ContextVisFunc = (
  trainSet: TrainSet,
  testSet: ContextTestSet,
  results: ContextResult[]
) => void;

type ContextScoreFunc = (result: ContextResult) => number;

type ContextProblem = Problem & {
  type: "context";
  testSet: ContextTestSet;
  scoreFunctions: ContextScoreFunc[];
  visualisationFunction: ContextVisFunc;
};

// #############
// ## intents ##
// #############
type IntentTestSet = TestSet & {
  type: "intent";
  tests: IntentTest[];
};

type IntentLabel = string[];

type IntentTest = Test & {
  label: IntentLabel;
};

type IntentPrediction = {
  [intent: string]: number;
};

type IntentResult = Result & {
  text: string;
  prediction: IntentPrediction;
  label: IntentLabel;
};

type IntentVisFunc = (
  trainSet: TrainSet,
  testSet: IntentTestSet,
  results: IntentResult[]
) => void;

type IntentScoreFunc = (result: IntentResult) => number;

type IntentProblem = Problem & {
  type: "intent";
  testSet: IntentTestSet;
  scoreFunctions: IntentScoreFunc[];
  visualisationFunction: IntentVisFunc;
};

// ###########
// ## slots ##
// ###########
type SlotTestSet = TestSet & {
  type: "slot";
  tests: SlotTest[];
};

type SlotLabel = { start: number; end: number; name: string }[];

type SlotTest = Test & {
  label: SlotLabel;
};

type SlotPrediction = {
  [slot: string]: { start: number; end: number; confidence: number };
};

type SlotResult = Result & {
  text: string;
  testSet: SlotTestSet;
  prediction: SlotPrediction;
  label: SlotLabel;
};

type SlotVisFunc = (
  trainSet: TrainSet,
  testSet: SlotTestSet,
  results: SlotResult[]
) => void;

type SlotScoreFunc = (result: SlotResult) => number;

type SlotProblem = Problem & {
  type: "slot";
  scoreFunctions: SlotScoreFunc[];
  visualisationFunction: SlotVisFunc;
};
