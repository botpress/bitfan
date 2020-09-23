import * as sdk from "bitfan/sdk";

export class BpMisunderstoodEngine implements sdk.Engine<"misunderstood"> {
  constructor(endpoint: string, password: string) {}
  train(input: sdk.DataSet<"misunderstood">, seed: number) {}
  predict(text: string, lang: string): sdk.Prediction<"misunderstood"> {
    return {} as sdk.Prediction<"misunderstood">;
  }
}

export class BpContextEngine implements sdk.Engine<"context"> {
  constructor(endpoint: string, password: string) {}
  train(input: sdk.DataSet<"context">, seed: number) {}
  predict(text: string, lang: string): sdk.Prediction<"context"> {
    return {} as sdk.Prediction<"context">;
  }
}

export class BpIntentEngine implements sdk.Engine<"intent"> {
  constructor(endpoint: string, password: string) {}
  train(input: sdk.DataSet<"intent">, seed: number) {}
  predict(text: string, lang: string): sdk.Prediction<"intent"> {
    return {} as sdk.Prediction<"intent">;
  }
}

export class BpSlotEngine implements sdk.Engine<"slot"> {
  constructor(endpoint: string, password: string) {}
  train(input: sdk.DataSet<"slot">, seed: number) {}
  predict(text: string, lang: string): sdk.Prediction<"slot"> {
    return {} as sdk.Prediction<"slot">;
  }
}
