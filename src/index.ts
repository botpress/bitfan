import _ from "lodash";
import * as sdk from "src/bitfan";

import { labelIs, labelHasTopic } from "./builtin/criterias/intent";
import { slotsAre, slotIncludes, slotCountIs } from "./builtin/criterias/slot";

import {
  mostConfident,
  mostConfidents,
} from "./builtin/election/mostConfident";

import {
  oosAccuracy,
  oosPrecision,
  oosRecall,
  oosF1,
} from "./builtin/metrics/oos";
import { inScopeAccuracy } from "./builtin/metrics/in-scope";
import { averageScore } from "./builtin/metrics/avgScores";

import {
  showClassDistribution,
  showDatasetsSummary,
} from "./builtin/visualisation/dataset";
import { showSlotsResults } from "./builtin/visualisation/slots";
import { showOOSConfusion } from "./builtin/visualisation/oos";
import {
  showReport,
  showComparisonReport,
} from "./builtin/visualisation/report";

import { trainTestSplit, subSample } from "./builtin/sampling/trainTestSplit";
import { splitOOS, pickOOS } from "./builtin/sampling/splitAndMakeOOS";
import { sampleClasses } from "./builtin/sampling/samplesClasses";

import { BpIntentEngine } from "./builtin/engines/intent";
import { BpTopicEngine } from "./builtin/engines/topic";
import { BpIntentTopicEngine } from "./builtin/engines/intent-topic";
import { BpSlotEngine } from "./builtin/engines/slot";

import { areSame, isOOS, makeKey } from "./builtin/labels";

import { transposeTable } from "./builtin/tables/transpose";
import { roundDic, roundTable } from "./builtin/tables/round";
import { initDic, initTable } from "./builtin/tables/init";
import { tabelize } from "./builtin/tables/tabelize";
import { isAllDefined } from "./builtin/tables/guards";

import runSolution from "./solution";
import evaluateMetrics from "./report";
import comparePerformances from "./compare";

import DatasetRepository from "./services/dataset-repository";

const dsRepo = new DatasetRepository();

// TODO: write actual implementation
const impl: typeof sdk = {
  runSolution,
  evaluateMetrics,
  comparePerformances,

  labels: {
    isOOS,
    areSame,
    makeKey,
  },

  election: {
    mostConfident,
    mostConfidents,
  },

  sampling: {
    trainTestSplit,
    subSample,
    splitOOS,
    pickOOS,
    sampleClasses,
  },

  // TODO lazy load these...
  datasets: {
    bpds: {
      intents: {
        train: {
          A: dsRepo.getDataset("intent", "en", "bpdsA-train"),
          B: dsRepo.getDataset("intent", "en", "bpdsB-train"),
          C: dsRepo.getDataset("intent", "en", "bpdsC-train"),
          D: dsRepo.getDataset("intent", "en", "bpdsD-train"),
          E: dsRepo.getDataset("intent", "en", "bpdsE-train"),
          F: dsRepo.getDataset("intent", "en", "bpdsF-train"),
        },
        test: {
          A: dsRepo.getDataset("intent", "en", "bpdsA-test"),
          B: dsRepo.getDataset("intent", "en", "bpdsB-test"),
          C: dsRepo.getDataset("intent", "en", "bpdsC-test"),
          D: dsRepo.getDataset("intent", "en", "bpdsD-test"),
          E: dsRepo.getDataset("intent", "en", "bpdsE-test"),
          F: dsRepo.getDataset("intent", "en", "bpdsF-test"),
        },
      },
      slots: {
        train: {
          A: dsRepo.getDataset("slot", "en", "bpdsA-train"),
          B: dsRepo.getDataset("slot", "en", "bpdsB-train"),
          C: dsRepo.getDataset("slot", "en", "bpdsC-train"),
          D: dsRepo.getDataset("slot", "en", "bpdsD-train"),
          E: dsRepo.getDataset("slot", "en", "bpdsE-train"),
          F: dsRepo.getDataset("slot", "en", "bpdsF-train"),
          G: dsRepo.getDataset("slot", "en", "bpdsG-train"),
          H: dsRepo.getDataset("slot", "en", "bpdsH-train"),
          I: dsRepo.getDataset("slot", "en", "bpdsI-train"),
          J: dsRepo.getDataset("slot", "en", "bpdsJ-train"),
        },
        test: {
          A: dsRepo.getDataset("slot", "en", "bpdsA-test"),
          B: dsRepo.getDataset("slot", "en", "bpdsB-test"),
          C: dsRepo.getDataset("slot", "en", "bpdsC-test"),
          D: dsRepo.getDataset("slot", "en", "bpdsD-test"),
          E: dsRepo.getDataset("slot", "en", "bpdsE-test"),
          F: dsRepo.getDataset("slot", "en", "bpdsF-test"),
          G: dsRepo.getDataset("slot", "en", "bpdsG-test"),
          H: dsRepo.getDataset("slot", "en", "bpdsH-test"),
          I: dsRepo.getDataset("slot", "en", "bpdsI-test"),
          J: dsRepo.getDataset("slot", "en", "bpdsJ-test"),
        },
      },
    },
  },

  criterias: {
    labelIs,
    labelHasTopic,
    slotsAre,
    slotCountIs,
    slotIncludes,
  },

  metrics: {
    averageScore,
    accuracy: {
      name: "accuracy",
      eval: averageScore(labelIs).eval,
    },
    inScopeAccuracy,
    oosAccuracy,
    oosPrecision,
    oosRecall,
    oosF1,
  },

  visualisation: {
    showOOSConfusion,
    showReport,
    showComparisonReport,
    showClassDistribution,
    showDatasetsSummary,
    showSlotsResults,
  },

  engines: {
    makeBpTopicEngine: (bpEndpoint: string, password: string) =>
      new BpTopicEngine(bpEndpoint, password),
    makeBpIntentEngine: (bpEndpoint: string, password: string) =>
      new BpIntentEngine(bpEndpoint, password),
    makeBpIntentTopicEngine: (bpEndpoint: string, password: string) =>
      new BpIntentTopicEngine(bpEndpoint, password),
    makeBpSlotEngine: (bpEndpoint: string, password: string) =>
      new BpSlotEngine(bpEndpoint, password),
  },

  tables: {
    tabelize,
    initDic,
    initTable,
    roundDic,
    roundTable,
    transposeTable,
    isAllDefined,
  },
};

export default impl;
