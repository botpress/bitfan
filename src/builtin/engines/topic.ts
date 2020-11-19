import * as sdk from "bitfan/sdk";
import _ from "lodash";
import { areSame, makeKey, OOS } from "../../builtin/labels";

import { StanProvider } from "../../services/bp-provider/stan-provider";
import {
  BpTrainInput,
  PredictedTopic,
} from "src/services/bp-provider/stan-typings";

const BATCH_SIZE = 10;

export class BpTopicEngine implements sdk.Engine<"topic"> {
  private _stanProvider: StanProvider;

  constructor(bpEndpoint: string, password: string) {
    this._stanProvider = new StanProvider(bpEndpoint, password);
  }

  train(
    trainSet: sdk.DataSet<"topic">,
    seed: number,
    progress: sdk.ProgressCb
  ) {
    const samples = trainSet.samples;

    const allTopics = _(samples)
      .map((r) => r.label)
      .uniqWith(areSame)
      .value();

    const topics = allTopics.map((t) => {
      const samplesOfTopic = samples.filter((s) => areSame(s.label, t));

      return {
        name: makeKey(t),
        intents: [
          {
            name: this._makeIntenName(t),
            variables: [],
            examples: samplesOfTopic.map((s) => s.text),
          },
        ],
      };
    });

    const trainInput: BpTrainInput = {
      language: trainSet.lang,
      enums: [],
      patterns: [],
      seed,
      topics,
    };

    return this._stanProvider.train(trainInput, (_time, progressPercent) => {
      progress(progressPercent);
    });
  }

  async predict(testSet: sdk.DataSet<"topic">, progress: sdk.ProgressCb) {
    const results: sdk.Prediction<"topic">[] = [];

    let done = 0;

    for (const batch of _.chunk(testSet.samples, BATCH_SIZE)) {
      const predictions = (
        await this._stanProvider.predict(batch.map((r) => r.text))
      ).map((p) => p.predictions);

      for (const [pred, row] of _.zip(predictions, batch)) {
        const { text, label } = row!;

        let mostConfidentTopic: PredictedTopic | undefined;

        const candidates: sdk.Candidate<"topic">[] = [];
        for (const topicLabel of Object.keys(pred!)) {
          const topic = pred![topicLabel];

          candidates.push({
            elected: topicLabel,
            confidence: topic.confidence,
          });

          if (
            !mostConfidentTopic ||
            mostConfidentTopic.confidence < topic.confidence
          ) {
            mostConfidentTopic = topic;
          }
        }

        candidates.push({
          elected: OOS,
          confidence: mostConfidentTopic!.oos,
        });

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

  private _makeIntenName(topic: sdk.Label<"topic">) {
    return `${makeKey(topic)}-intent`;
  }
}
