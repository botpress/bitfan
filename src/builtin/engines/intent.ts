import * as sdk from "bitfan/sdk";
import _ from "lodash";
import Progress from "progress";

import { StanProvider } from "../../services/bp-provider/stan-provider";
import {
  BpTrainInput,
  IntentPred,
} from "../../services/bp-provider/stan-typings";

const MAIN_TOPIC = "main";
const NONE = "none";

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
      examples: trainSet.rows
        .filter((r) => (r.label as string[]).includes(l))
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

    const progressBar = new Progress("Training: [:bar] (:current%), :times", {
      total: 100,
    });
    return this._stanProvider.train(trainInput, (time, progress) => {
      time = time / 1000;
      progressBar.update(progress, { time });
    });
  }

  private _makePredictions(
    intents: IntentPred[],
    oos: number
  ): sdk.Prediction<"intent-oos"> {
    const noneIntent = intents.find((i) => i.label.toLowerCase() === NONE);

    const prediction: sdk.Prediction<"intent"> = _(intents)
      .map((i) => [i.label, i] as [string, IntentPred])
      .fromPairs()
      .mapValues((i) => i.confidence)
      .value();

    delete prediction[NONE];
    const noneConfidence = noneIntent?.confidence ?? 0;
    prediction["oo-scope"] = Math.max(oos, noneConfidence);

    return prediction as sdk.Prediction<"intent-oos">;
  }

  async predict(testSet: sdk.DataSet<"intent-oos">) {
    const results: sdk.Result<"intent-oos">[] = [];

    const progressBar = new Progress("Prediction: [:bar] (:current/:total)", {
      total: testSet.rows.length,
    });

    for (const row of testSet.rows) {
      const { text, label } = row;

      const predictions = await this._stanProvider.predict(text);

      const { intents, oos } = predictions[MAIN_TOPIC];
      const prediction = this._makePredictions(intents, oos);

      results.push({
        text,
        label,
        prediction,
      });

      progressBar.tick();
    }
    return results;
  }
}
