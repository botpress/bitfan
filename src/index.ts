import _ from "lodash";
import * as sdk from "src/bitfan";

import {
  mostConfidentBinaryScore,
  oosBinaryScore,
  topicBinaryScore,
} from "./builtin/metrics/intent";

import { showSlotsResults } from "./builtin/visualisation/slots";
import { showOOSConfusion } from "./builtin/visualisation/oos";
import { showAverageScoreByMetric } from "./builtin/visualisation/metrics";
import {
  showClassDistribution,
  showDatasetsSummary,
} from "./builtin/visualisation/class-distribution";

import DatasetRepository from "./services/dataset-repository";
import { trainTestSplit } from "./builtin/tools/trainTestSplit";
import { splitOOS, pickOOS } from "./builtin/tools/splitAndMakeOOS";

import { BpIntentEngine } from "./builtin/engines/intent";
import { BpTopicEngine } from "./builtin/engines/topic";
import { BpIntentTopicEngine } from "./builtin/engines/intent-topic";
import { BpSlotEngine } from "./builtin/engines/slot";

import { areSame, isOOS, makeKey } from "./services/labels";
import runSolution from "./solution";
import { slotBinaryScore, slotScore, slotCount } from "./builtin/metrics/slot";

const dsRepo = new DatasetRepository();

// TODO: write actual implementation
const impl: typeof sdk = {
  runSolution,

  labels: {
    isOOS,
    areSame,
    makeKey,
  },

  tools: {
    trainTestSplit,
    splitOOS,
    pickOOS,
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
    covid: {
      en: dsRepo.getDataset("intent", "en", "covid"),
      fr: dsRepo.getDataset("intent", "fr", "covid"),
    },
  },

  metrics: {
    mostConfidentBinaryScore,
    oosBinaryScore,
    topicBinaryScore,
    slotBinaryScore,
    slotCount,
    slotScore,
  },

  visualisation: {
    showOOSConfusion,
    showAverageScoreByMetric,
    showClassDistribution,
    showDatasetsSummary,
    showSlotsResults,
  },

  engines: {
    BpTopicEngine,
    BpIntentEngine,
    BpIntentTopicEngine,
    BpSlotEngine,
  },
};

export default impl;
