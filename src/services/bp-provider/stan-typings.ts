export interface TrainingSession {
  key: string;
  status: TrainingStatus;
  language: string;
  progress: number;
}

type TrainingStatus =
  | "idle"
  | "done"
  | "needs-training"
  | "training"
  | "canceled"
  | "errored"
  | null;

export interface BpTrainInput {
  language: string;
  topics: Topic[];
  enums: Enum[];
  patterns: Pattern[]; // TODO: add complexs
  seed?: number;
}

export interface Topic {
  name: string;
  intents: IntentDef[];
}

export interface IntentDef {
  name: string;
  variables: Variable[];
  examples: string[];
}

export interface Variable {
  name: string;
  variableType: string;
}

export interface Enum {
  name: string;
  values: EnumOccurence[];
  fuzzy: number;
}

export interface EnumOccurence {
  name: string;
  synonyms: string[];
}

export interface Pattern {
  name: string;
  positive_regexes: string[];
  case_sensitive: boolean;
}

export type BpPredictError = { errored: true };

export type BpPredictOutput = {
  errored: false;
  language: string;
  detectedLanguage: string;
  spellChecked: string;
  entities: Entity[];
  slots: SlotCollection;
  predictions: Predictions;
  ms: number;
};

export type SlotCollection = {
  [slot: string]: Slot;
};

export interface Predictions {
  [context: string]: {
    confidence: number;
    oos: number;
    intents: IntentPred[];
  };
}

export interface IntentPred {
  label: string;
  confidence: number;
  slots: SlotCollection;
  extractor: "exact-matcher" | "classifier";
}

export interface Slot {
  name: string;
  value: any;
  source: any;
  entity: Entity;
  confidence: number;
  start: number;
  end: number;
}

export interface Intent {
  name: string;
  confidence: number;
  context: string;
  matches?: (intentPattern: string) => boolean;
}

export interface Entity {
  name: string;
  type: string;
  meta: EntityMeta;
  data: any;
}

export interface EntityMeta {
  sensitive: boolean;
  confidence: number;
  provider?: string;
  source: string;
  start: number;
  end: number;
  raw?: any;
}
