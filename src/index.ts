import _ from "lodash";
import * as sdk from "src/bitfan";

import {
  mostConfidentBinaryScore,
  oosBinaryScore,
  topicBinaryScore,
} from "./builtin/metrics/intent";

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
import { areSame, isOOS, makeKey } from "./services/labels";
import runSolution from "./solution";

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
      regression: {
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
  },

  visualisation: {
    showOOSConfusion,
    showAverageScoreByMetric,
    showClassDistribution,
    showDatasetsSummary,
  },

  engines: {
    BpTopicEngine,
    BpIntentEngine,
    BpIntentTopicEngine,
  },
};

export default impl;
