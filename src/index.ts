import * as sdk from "src/bitfan";
import _ from "lodash";

// TODO: write actual implementation
const impl: typeof sdk = {
  registerDataSet: (set: sdk.Dataset) => {
    console.log(set);
  },
  registerProblem: (problem: sdk.Problem) => {
    console.log(problem);
  },
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
    bpMisunderstoodEngine: {} as sdk.MisunderstoodEngine,
    bpContextEngine: {} as sdk.ContextEngine,
    bpIntentEngine: {} as sdk.IntentEngine,
    bpSlotEngine: {} as sdk.SlotEngine,
  },

  metrics: {
    binaryIntentScore: (res: sdk.IntentResult) => {
      const { text, label, prediction } = res;
      const predictions = Object.keys(prediction);
      return _.isEqual(_.orderBy(label), _.orderBy(prediction)) ? 1 : 0;
    },
  },
};

export default impl;
