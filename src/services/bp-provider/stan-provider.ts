import axios from "axios";

import { sleep } from "../../utils";

import {
  BpPredictError,
  BpPredictOutput,
  BpTrainInput,
  Predictions,
  TrainingSession,
} from "./stan-typings";

const POLLING_INTERVAL = 500;

export class StanProvider {
  private _modelId: string | undefined;

  constructor(
    private _stanEndpoint: string = "http://localhost:3200",
    private _password: string = "123456"
  ) {}

  public async getVersion(): Promise<{ version: string } | undefined> {
    try {
      const { data } = await axios.get(`${this._stanEndpoint}/info`); // just to see if breaking
      return data;
    } catch (err) {
      this._mapErrorAndRethrow("INFO", err);
    }
  }

  private async _getTrainingStatus(modelId: string): Promise<TrainingSession> {
    const { data } = await axios.get(`${this._stanEndpoint}/train/${modelId}`, {
      params: {
        password: this._password,
      },
    });
    return data.session;
  }

  private async _waitForTraining(
    modelId: string,
    loggingCb?: (time: number, progress: number) => void
  ) {
    let time = 0;

    let session = await this._getTrainingStatus(modelId);
    while (session.status === "training") {
      // TODO: add a max training time...
      await sleep(POLLING_INTERVAL);
      time += POLLING_INTERVAL;
      loggingCb && loggingCb(time, session.progress);

      session = await this._getTrainingStatus(modelId);
    }
  }

  public async train(
    trainInput: BpTrainInput,
    loggingCb?: (time: number, progress: number) => void
  ) {
    const inputWithPassword = { ...trainInput, password: this._password };

    try {
      const { data } = await axios.post(
        `${this._stanEndpoint}/train`,
        inputWithPassword
      );

      const { modelId } = data;
      this._modelId = modelId;
      await this._waitForTraining(modelId, loggingCb);
    } catch (err) {
      this._mapErrorAndRethrow("TRAIN", err);
    }
  }

  private _isPredictError(
    out: BpPredictError | BpPredictOutput
  ): out is BpPredictError {
    return !!out.errored;
  }

  private async _postPredict(
    texts: string[]
  ): Promise<{
    success: boolean;
    predictions: (BpPredictOutput | BpPredictError)[];
  }> {
    const { data } = await axios.post(
      `${this._stanEndpoint}/predict/${this._modelId}`,
      {
        texts,
        password: this._password,
      }
    );
    return data;
  }

  private async _fetchPrediction(
    texts: string[]
  ): Promise<(BpPredictOutput | BpPredictError)[]> {
    const { predictions } = await this._postPredict(texts);
    return predictions;
  }

  public async predict(texts: string[]): Promise<Predictions[]> {
    try {
      const predOutput = await this._fetchPrediction(texts);
      if (predOutput.some(this._isPredictError)) {
        throw new Error(
          "An error occured at prediction. The nature of the error is unknown."
        );
      }

      return (predOutput as BpPredictOutput[]).map((p) => p.predictions);
    } catch (err) {
      this._mapErrorAndRethrow("PREDICT", err);
    }
  }

  private _mapErrorAndRethrow(prefix: string, err: any): never {
    let custom = err?.response?.data?.error ?? "http related error";
    let msg = `[${prefix}] ${err.message}\n${custom}`;
    throw new Error(msg);
  }
}
