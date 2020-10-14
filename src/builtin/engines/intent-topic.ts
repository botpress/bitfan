import * as sdk from "bitfan/sdk";
import _ from "lodash";
import { areSame, makeKey, OOS, splitIntentTopic } from "../../services/labels";

import { StanProvider } from "../../services/bp-provider/stan-provider";
import {
  BpTrainInput,
  PredictedTopic,
} from "src/services/bp-provider/stan-typings";

const BATCH_SIZE = 10;

export class BpIntentTopicEngine implements sdk.Engine<"intent-topic"> {
  private _stanProvider: StanProvider;

  constructor(bpEndpoint: string, password: string) {
    this._stanProvider = new StanProvider(bpEndpoint, password);
  }

  train(
    trainSet: sdk.DataSet<"intent-topic">,
    seed: number,
    progress: sdk.ProgressCb
  ) {
    const samples = trainSet.rows.map((r) => ({
      ...r,
      ...splitIntentTopic(r.label),
    }));

    const allTopics = _(samples)
      .flatMap((r) => r.topic)
      .uniq()
      .value();

    const topics = allTopics.map((t) => {
      const allIntents = _(samples)
        .flatMap((r) => r.intent)
        .uniq()
        .value();

      return {
        name: t,
        intents: allIntents.map((i) => {
          return {
            name: i,
            variables: [],
            examples: samples
              .filter((s) => s.topic === t && s.intent === i)
              .map((s) => s.text),
          };
        }),
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

  async predict(
    testSet: sdk.DataSet<"intent-topic">,
    progress: sdk.ProgressCb
  ) {
    const results: sdk.PredictOutput<"intent-topic">[] = [];

    let done = 0;

    for (const batch of _.chunk(testSet.rows, BATCH_SIZE)) {
      const predictions = await this._stanProvider.predict(
        batch.map((r) => r.text)
      );

      for (const [pred, row] of _.zip(predictions, batch)) {
        const { text, label } = row!;

        let mostConfidentTopic: PredictedTopic | undefined;

        const prediction: _.Dictionary<number> = {};
        for (const topicLabel of Object.keys(pred!)) {
          const topic = pred![topicLabel];

          for (const intent of topic.intents) {
            prediction[`${topicLabel}/${intent.label}`] =
              topic.confidence * intent.confidence;
          }

          if (
            !mostConfidentTopic ||
            mostConfidentTopic.confidence < topic.confidence
          ) {
            mostConfidentTopic = topic;
          }
        }

        prediction[OOS] = mostConfidentTopic!.oos;

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
