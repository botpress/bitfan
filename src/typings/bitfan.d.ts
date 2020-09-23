import {
  AtLeastOne,
  BaseProblem,
  DataSet,
  ScoreFunction,
  Engine,
  ProblemType as ProbTypes,
} from "./base";

export function runSolution(solution: Solution): void;

export type ProblemType = ProbTypes;

type Solution = {
  problems: Problem[];
  seeds: number[];
} & AtLeastOne<{
  misunderstoodEngine: MisunderstoodEngine;
  contextEngine: ContextEngine;
  intentEngine: IntentEngine;
  slotEngine: SlotEngine;
  spellEngine: SpellEngine;
  langEngine: LangEngine;
}>;

type Problem =
  | MisunderstoodProblem
  | ContextProblem
  | IntentProblem
  | SlotProblem
  | LangProblem
  | SpellProblem;

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
  export class BpMisunderstoodEngine implements MisunderstoodEngine {
    constructor(endpoint: string, password: string);
    train: (input: MisunderstoodDataSet, seed: number) => void;
    predict: (text: string, lang: string) => MisunderstoodPrediction;
  }

  export class BpContextEngine implements ContextEngine {
    constructor(endpoint: string, password: string);
    train: (input: ContextDataSet, seed: number) => void;
    predict: (text: string, lang: string) => ContextPrediction;
  }

  export class BpIntentEngine implements IntentEngine {
    constructor(endpoint: string, password: string);
    train: (input: IntentDataSet, seed: number) => void;
    predict: (text: string, lang: string) => IntentPrediction;
  }

  export class BpSlotEngine implements SlotEngine {
    constructor(endpoint: string, password: string);
    train: (input: SlotDataSet, seed: number) => void;
    predict: (text: string, lang: string) => SlotPrediction;
  }
}

export namespace metrics {
  export const binaryIntentScore: ScoreFunction<IntentPrediction, IntentLabel>;
}

// #######################
// #### misunderstood ####
// #######################
type MisunderstoodLabel = boolean; // misunderstood or not
interface MisunderstoodPrediction {
  [ctx: string]: number;
}
type MisunderstoodProblem = BaseProblem<
  "misunderstood",
  MisunderstoodPrediction,
  MisunderstoodLabel
>;
type MisunderstoodEngine = Engine<
  "misunderstood",
  MisunderstoodPrediction,
  MisunderstoodLabel
>;
type MisunderstoodDataSet = DataSet<"misunderstood", MisunderstoodLabel>;

// #######################
// ####### context #######
// #######################
type ContextLabel = string;
interface ContextPrediction {
  [ctx: string]: number;
}
type ContextProblem = BaseProblem<"context", ContextPrediction, ContextLabel>;
type ContextEngine = Engine<"context", ContextPrediction, ContextLabel>;
type ContextDataSet = DataSet<"context", ContextLabel>;

// #######################
// ####### intents #######
// #######################
type IntentLabel = string[];
interface IntentPrediction {
  [intent: string]: number;
}
type IntentProblem = BaseProblem<"intent", IntentPrediction, IntentLabel>;
type IntentEngine = Engine<"intent", IntentPrediction, IntentLabel>;
type IntentDataSet = DataSet<"intent", IntentLabel>;

// #######################
// ######## slots ########
// #######################
type SlotLabel = { name: string; start: number; end: number }[];
interface SlotPrediction {
  [slot: string]: { start: number; end: number; confidence: number };
}
type SlotProblem = BaseProblem<"slot", SlotPrediction, SlotLabel>;
type SlotEngine = Engine<"slot", SlotPrediction, SlotLabel>;
type SlotDataSet = DataSet<"slot", SlotLabel>;

// ######################
// ######## lang ########
// ######################
type LangLabel = string;
type LangPrediction = string;
type LangProblem = BaseProblem<"lang", LangPrediction, LangLabel>;
type LangEngine = Engine<"lang", LangPrediction, LangLabel>;
type LangDataSet = DataSet<"lang", LangLabel>;

// #######################
// ######## spell ########
// #######################
type SpellLabel = string;
type SpellPrediction = string;
type SpellProblem = BaseProblem<"spell", SpellPrediction, SpellLabel>;
type SpellEngine = Engine<"spell", SpellPrediction, SpellLabel>;
type spellDataSet = DataSet<"spell", SpellLabel>;
