import * as sdk from "bitfan/sdk";
import _ from "lodash";
import { StanProvider } from "src/services/bp-provider/stan-provider";
import { BpTrainInput } from "src/services/bp-provider/stan-typings";

export class BpIntentOOSEngine implements sdk.Engine<"intent-oos"> {
  private _stanProvider: StanProvider;

  constructor(bpEndpoint?: string, password?: string) {
    this._stanProvider = new StanProvider(bpEndpoint, password);
  }

  train(trainSet: sdk.DataSet<"intent-oos">, seed: number) {
    const allLabels = _(trainSet.rows)
      .flatMap((r) => r.label)
      .uniq()
      .value();

    const intents = allLabels.map((l) => ({
      name: l,
      variables: [],
      examples: trainSet.rows.filter((r) => r.label === l).map((r) => r.text),
    }));

    const trainInput: BpTrainInput = {
      language: trainSet.lang,
      enums: [],
      patterns: [],
      seed,
      topics: [
        {
          name: "main",
          intents,
        },
      ],
    };

    return this._stanProvider.train(trainInput);
  }

  predict(testSet: sdk.DataSet<"intent-oos">) {
    return [];
  }
}
