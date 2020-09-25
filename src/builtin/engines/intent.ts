import * as sdk from "bitfan/sdk";
import { StanProvider } from "src/services/bp-provider/stan-provider";
import { BpTrainInput } from "src/services/bp-provider/stan-typings";

export class BpIntentOOSEngine implements sdk.Engine<"intent-oos"> {
  private _stanProvider: StanProvider;

  constructor(bpEndpoint?: string, password?: string) {
    this._stanProvider = new StanProvider(bpEndpoint, password);
  }

  train(trainSet: sdk.DataSet<"intent-oos">, seed: number) {
    const trainInput: BpTrainInput = {
      language: trainSet.lang,
      enums: [],
      patterns: [],
      seed,
      topics: [], // TODO implement this
    };
  }

  predict(testSet: sdk.DataSet<"intent-oos">) {
    return [];
  }
}
