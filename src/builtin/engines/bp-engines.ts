import * as sdk from "bitfan/sdk";

export class BpMisunderstoodEngine implements sdk.MisunderstoodEngine {
  train(input: sdk.MisunderstoodDataSet, seed: number) {}
  predict(text: string, lang: string) {
    return {} as sdk.MisunderstoodPrediction;
  }
}

export class BpContextEngine implements sdk.ContextEngine {
  train(input: sdk.ContextDataSet, seed: number) {}
  predict(text: string, lang: string) {
    return {} as sdk.ContextPrediction;
  }
}

export class BpIntentEngine implements sdk.IntentEngine {
  train(input: sdk.IntentDataSet, seed: number) {}
  predict(text: string, lang: string) {
    return {} as sdk.IntentPrediction;
  }
}

export class BpSlotEngine implements sdk.SlotEngine {
  train(input: sdk.SlotDataSet, seed: number) {}
  predict(text: string, lang: string) {
    return {} as sdk.SlotPrediction;
  }
}
