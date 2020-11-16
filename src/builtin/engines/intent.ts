import * as sdk from "bitfan/sdk";
import _ from "lodash";
import { areSame, getOOSLabel, makeKey } from "../../builtin/labels";

import { StanProvider } from "../../services/bp-provider/stan-provider";
import {
  BpTrainInput,
  IntentPred,
} from "../../services/bp-provider/stan-typings";

const MAIN_TOPIC = "main";

const BATCH_SIZE = 10;

export class BpIntentEngine implements sdk.Engine<"intent"> {
  private _stanProvider: StanProvider;
  private _skipTraining: boolean;

  constructor(
    bpEndpoint: string,
    password: string,
    opt?: Partial<sdk.BpEngineOptions>
  ) {
    this._stanProvider = new StanProvider(bpEndpoint, password, opt);
    this._skipTraining = _.isString(opt?.modelId);
  }

  async train(
    trainSet: sdk.DataSet<"intent">,
    seed: number,
    progress: sdk.ProgressCb
  ) {
    if (this._skipTraining) {
      return;
    }

    const allLabels = _(trainSet.samples)
      .flatMap((r) => r.label)
      .uniq()
      .value();

    const intents = allLabels.map((l) => ({
      name: makeKey(l),
      variables: [],
      examples: trainSet.samples
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
    const prediction: sdk.Understanding<"intent"> = _(intents)
      .map((i) => [i.label, i] as [string, IntentPred])
      .fromPairs()
      .mapValues((i) => i.confidence)
      .value();
    prediction[getOOSLabel()] = oos;
    return prediction;
  }

  async predict(testSet: sdk.DataSet<"intent">, progress: sdk.ProgressCb) {
    const results: sdk.PredictOutput<"intent">[] = [];

    let done = 0;

    for (const batch of _.chunk(testSet.samples, BATCH_SIZE)) {
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

        progress(done++ / testSet.samples.length);
      }
    }
    return results;
  }
}
