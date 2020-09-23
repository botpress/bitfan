import * as sdk from "bitfan/sdk";

import {
  BpMisunderstoodEngine,
  BpContextEngine,
  BpIntentEngine,
  BpSlotEngine,
} from "./builtin/engines/bp-engines";

import { binaryIntentScore } from "./builtin/metrics/intent";

// TODO: write actual implementation
const impl: typeof sdk = {
  runSolution: (solution: sdk.Solution) => {
    console.log(solution);
  },

  datasets: {
    bpdsRegressionA: {} as sdk.IntentDataSet,
    bpdsRegressionB: {} as sdk.IntentDataSet,
    bpdsRegressionC: {} as sdk.IntentDataSet,
    bpdsRegressionD: {} as sdk.IntentDataSet,
    bpdsRegressionE: {} as sdk.IntentDataSet,
    bpdsRegressionF: {} as sdk.IntentDataSet,

    bpdsSlotA: {} as sdk.SlotDataSet,
    bpdsSlotB: {} as sdk.SlotDataSet,
    bpdsSlotC: {} as sdk.SlotDataSet,
    bpdsSlotD: {} as sdk.SlotDataSet,
    bpdsSlotE: {} as sdk.SlotDataSet,
    bpdsSlotF: {} as sdk.SlotDataSet,
    bpdsSlotG: {} as sdk.SlotDataSet,
    bpdsSlotH: {} as sdk.SlotDataSet,
    bpdsSlotI: {} as sdk.SlotDataSet,
    bpdsSlotJ: {} as sdk.SlotDataSet,
  },

  engines: {
    BpMisunderstoodEngine,
    BpContextEngine,
    BpIntentEngine,
    BpSlotEngine,
  },

  metrics: {
    binaryIntentScore,
  },
};

export default impl;
