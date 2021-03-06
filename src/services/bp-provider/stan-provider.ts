import axios from "axios";

import { sleep } from "../../utils";

import { PredictOutput, TrainingSession, TrainInput } from "./stan-typings";

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
    while (
      session.status === "training" ||
      session.status === "training-pending"
    ) {
      // TODO: add a max training time...
      await sleep(POLLING_INTERVAL);
      time += POLLING_INTERVAL;
      loggingCb && loggingCb(time, session.progress);

      session = await this._getTrainingStatus(modelId);
    }

    if (session.status !== "done") {
      throw new Error(`Training is done, but status is ${session.status}`);
    }
  }

  public async train(
    trainInput: TrainInput,
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

  private async _postPredict(
    utterances: string[]
  ): Promise<{
    success: boolean;
    predictions: PredictOutput[];
  }> {
    const { data } = await axios.post(
      `${this._stanEndpoint}/predict/${this._modelId}`,
      {
        utterances,
        password: this._password,
      }
    );
    return data;
  }

  public async predict(texts: string[]): Promise<PredictOutput[]> {
    try {
      const predOutput = await this._postPredict(texts);
      if (!predOutput.success) {
        throw new Error(
          "An error occured at prediction. The nature of the error is unknown."
        );
      }

      return predOutput.predictions;
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
