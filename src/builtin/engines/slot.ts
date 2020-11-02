import * as sdk from "bitfan/sdk";
import _ from "lodash";

import { StanProvider } from "../../services/bp-provider/stan-provider";
import { BpTrainInput } from "../../services/bp-provider/stan-typings";

const MAIN_TOPIC = "main";
const MAIN_INTENT = "main";

const BATCH_SIZE = 10;

export class BpSlotEngine implements sdk.Engine<"slot"> {
  private _stanProvider: StanProvider;

  constructor(bpEndpoint?: string, password?: string) {
    this._stanProvider = new StanProvider(bpEndpoint, password);
  }

  train(trainSet: sdk.DataSet<"slot">, seed: number, progress: sdk.ProgressCb) {
    const { enums, patterns, lang, samples: rows, variables } = trainSet;

    const examples = rows.map((r) => {
      const { text, label } = r;

      let sanitized = `${text}`;
      let addedLength = 0;
      for (const l of label) {
        const beforeSlot = sanitized.slice(0, l.start + addedLength);
        const slot = sanitized.slice(
          l.start + addedLength,
          l.end + addedLength
        );
        const afterSlot = sanitized.slice(
          l.end + addedLength,
          sanitized.length
        );
        const markdown = `[${slot}](${l.name})`;

        addedLength += markdown.length - slot.length;
        sanitized = beforeSlot + markdown + afterSlot;
      }

      return sanitized;
    });

    const trainInput: BpTrainInput = {
      enums: enums || [],
      patterns: patterns || [],
      language: lang,
      seed,
      topics: [
        {
          name: MAIN_TOPIC,
          intents: [
            {
              name: MAIN_INTENT,
              variables: variables || [],
              examples,
            },
          ],
        },
      ],
    };

    return this._stanProvider.train(trainInput, (_time, progressPercent) => {
      progress(progressPercent);
    });
  }

  async predict(testSet: sdk.DataSet<"slot">, progress: sdk.ProgressCb) {
    const results: sdk.PredictOutput<"slot">[] = [];

    let done = 0;

    for (const batch of _.chunk(testSet.samples, BATCH_SIZE)) {
      const predictions = await this._stanProvider.predict(
        batch.map((r) => r.text)
      );

      for (const { pred, row } of _.zipWith(
        predictions,
        batch,
        (pred, row) => ({ pred, row })
      )) {
        const { text, label } = row;
        const { intents } = pred[MAIN_TOPIC];
        const mainIntent = intents.find((i) => i.label === MAIN_INTENT);

        const prediction = _.mapValues(
          mainIntent?.slots,
          ({ start, end, confidence }) => ({
            start,
            end,
            confidence,
          })
        );

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
