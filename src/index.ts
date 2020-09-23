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
    bpdsRegressionA: {} as sdk.DataSet<"intent">,
    bpdsRegressionB: {} as sdk.DataSet<"intent">,
    bpdsRegressionC: {} as sdk.DataSet<"intent">,
    bpdsRegressionD: {} as sdk.DataSet<"intent">,
    bpdsRegressionE: {} as sdk.DataSet<"intent">,
    bpdsRegressionF: {} as sdk.DataSet<"intent">,

    bpdsSlotA: {} as sdk.DataSet<"slot">,
    bpdsSlotB: {} as sdk.DataSet<"slot">,
    bpdsSlotC: {} as sdk.DataSet<"slot">,
    bpdsSlotD: {} as sdk.DataSet<"slot">,
    bpdsSlotE: {} as sdk.DataSet<"slot">,
    bpdsSlotF: {} as sdk.DataSet<"slot">,
    bpdsSlotG: {} as sdk.DataSet<"slot">,
    bpdsSlotH: {} as sdk.DataSet<"slot">,
    bpdsSlotI: {} as sdk.DataSet<"slot">,
    bpdsSlotJ: {} as sdk.DataSet<"slot">,
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
