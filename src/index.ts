import * as sdk from "src/bitfan";
import _ from "lodash";

class BpMisunderstoodEngine implements sdk.MisunderstoodEngine {
  train(input: sdk.MisunderstoodDataSet, seed: number) {}
  predict(text: string, lang: string) {
    return {} as sdk.MisunderstoodPrediction;
  }
}

class BpContextEngine implements sdk.ContextEngine {
  train(input: sdk.ContextDataSet, seed: number) {}
  predict(text: string, lang: string) {
    return {} as sdk.ContextPrediction;
  }
}

class BpIntentEngine implements sdk.IntentEngine {
  train(input: sdk.IntentDataSet, seed: number) {}
  predict(text: string, lang: string) {
    return {} as sdk.IntentPrediction;
  }
}

class BpSlotEngine implements sdk.SlotEngine {
  train(input: sdk.SlotDataSet, seed: number) {}
  predict(text: string, lang: string) {
    return {} as sdk.SlotPrediction;
  }
}

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
    binaryIntentScore: (res: sdk.IntentResult) => {
      const { text, label, prediction } = res;
      const predictions = Object.keys(prediction);
      return _.isEqual(_.orderBy(label), _.orderBy(prediction)) ? 1 : 0;
    },
  },
};

export default impl;
