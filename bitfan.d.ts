type BotpressTrainingInput = any;
type SlotExtraction = { name: string; start: number; end: number };

export function registerTrainSet(set: TrainSet): void;
export function registerTestSet(set: TestSet): void;
export function registerProblem(problem: Problem): void;
export function runSolution(solution: Solution): void;

type ProblemType = "misunderstood" | "context" | "intent" | "slot";

type Solution = {
  name: string;
  problems: string[];
  seeds: number[];
  engine: string;
};

type Problem = {
  name: string;
  type: ProblemType;
  trainSet: TrainSet;
  testSet: TestSet;
  lang: string;
  scoreFunctions: ScoreFunction[]; // threshold and elections are contained in these score-functions
  visualisationFunction: VisualisationFunction;
};

type Result = {
  text: string;
  prediction: any;
  label: any;
};

type ScoreFunction = (result: Result) => number; // number between 0 and 1

type VisualisationFunction = (
  trainSet: BotpressTrainingInput,
  testSet: TestSet,
  results: Result[]
) => void;

type TrainSet = BotpressTrainingInput & {
  name: string;
};

type TestSet = {
  id: string;
  type: ProblemType;
  tests: {
    text: string;
    label: any;
  }[];
};

type NLUEngine = {
  id: string;
  train: (input: BotpressTrainingInput) => void;
  predict: (text: string, lang: string) => any;
};
