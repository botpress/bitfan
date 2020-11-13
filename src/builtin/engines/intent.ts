import * as sdk from "bitfan/sdk";
import _ from "lodash";
import { areSame, getOOSLabel, makeKey } from "../../builtin/labels";

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
  ): sdk.Candidate<"intent">[] {
    const candidates: sdk.Candidate<"intent">[] = intents.map(
      ({ label: elected, confidence }) => ({
        elected,
        confidence,
      })
    );

    candidates.push({
      elected: getOOSLabel(),
      confidence: oos,
    });

    return candidates;
  }

  async predict(testSet: sdk.DataSet<"intent">, progress: sdk.ProgressCb) {
    const results: sdk.Prediction<"intent">[] = [];

    let done = 0;

    for (const batch of _.chunk(testSet.samples, BATCH_SIZE)) {
      const predictions = await this._stanProvider.predict(
        batch.map((r) => r.text)
      );

      for (const [pred, row] of _.zip(predictions, batch)) {
        const { text, label } = row!;
        const { intents, oos } = pred![MAIN_TOPIC];
        const candidates = this._makePredictions(intents, oos);

        results.push({
          text,
          label,
          candidates,
        });

        progress(done++ / testSet.samples.length);
      }
    }
    return results;
  }
}
