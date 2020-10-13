import * as sdk from "bitfan/sdk";
import _ from "lodash";
import { areSame, makeKey } from "../../services/labels";

import { StanProvider } from "../../services/bp-provider/stan-provider";
import {
  BpTrainInput,
  IntentPred,
} from "../../services/bp-provider/stan-typings";

const MAIN_TOPIC = "main";
const NONE = "none";

const BATCH_SIZE = 10;

export class BpIntentEngine implements sdk.Engine<"intent"> {
  private _stanProvider: StanProvider;

  constructor(bpEndpoint?: string, password?: string) {
    this._stanProvider = new StanProvider(bpEndpoint, password);
  }

  train(
    trainSet: sdk.DataSet<"intent">,
    seed: number,
    progress: sdk.ProgressCb
  ) {
    const allLabels = _(trainSet.rows)
      .flatMap((r) => r.label)
      .uniq()
      .value();

    const intents = allLabels.map((l) => ({
      name: makeKey(l),
      variables: [],
      examples: trainSet.rows
        .filter((r) => areSame(r.label, l))
        .map((r) => r.text),
    }));

    const trainInput: BpTrainInput = {
      language: trainSet.lang,
      enums: [],
      patterns: [],
      seed,
      topics: [
        {
          name: MAIN_TOPIC,
          intents,
        },
      ],
    };

    return this._stanProvider.train(trainInput, (_time, progressPercent) => {
      progress(progressPercent);
    });
  }

  private _makePredictions(
    intents: IntentPred[],
    oos: number
  ): sdk.Understanding<"intent"> {
    const noneIntent = intents.find((i) => i.label.toLowerCase() === NONE);

    const prediction: sdk.Understanding<"intent"> = _(intents)
      .map((i) => [i.label, i] as [string, IntentPred])
      .fromPairs()
      .mapValues((i) => i.confidence)
      .value();

    delete prediction[NONE];
    const noneConfidence = noneIntent?.confidence ?? 0;
    prediction["oos"] = Math.max(oos, noneConfidence);

    return prediction as sdk.Understanding<"intent">;
  }

  async predict(testSet: sdk.DataSet<"intent">, progress: sdk.ProgressCb) {
    const results: sdk.PredictOutput<"intent">[] = [];

    let done = 0;

    for (const batch of _.chunk(testSet.rows, BATCH_SIZE)) {
      const predictions = await this._stanProvider.predict(
        batch.map((r) => r.text)
      );

      for (const [pred, row] of _.zip(predictions, batch)) {
        const { text, label } = row!;
        const { intents, oos } = pred![MAIN_TOPIC];
        const prediction = this._makePredictions(intents, oos);

        results.push({
          text,
          label,
          prediction,
        });

        progress(done++ / testSet.rows.length);
      }
    }
    return results;
  }
}
