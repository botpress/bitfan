import axios from "axios";

import { BpPredictOutput, BpTrainInput, TrainingSession } from "./stan-typings";

const POLLING_INTERVAL = 500;

export class StanProvider {
  private _modelId: string | undefined;

  constructor(
    private _stanEndpoint: string = "http://localhost:3200",
    private _password: string = ""
  ) {}

  public async getVersion(): Promise<{ version: string } | undefined> {
    try {
      const { data } = await axios.get(`${this._stanEndpoint}/info`); // just to see if breaking
      return data;
    } catch (err) {
      return;
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

  private async _isTraining(modelId: string) {
    const session = await this._getTrainingStatus(modelId);
    return session.status === "training";
  }

  private _sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private async _waitForTraining(
    modelId: string,
    loggingCb?: (time: number) => void
  ) {
    let time = 0;
    while (await this._isTraining(modelId)) {
      // TODO: add a max training time...
      await this._sleep(POLLING_INTERVAL);
      time += POLLING_INTERVAL;
      loggingCb && loggingCb(time);
    }
  }

  public async train(
    trainInput: BpTrainInput,
    loggingCb?: (time: number) => void
  ) {
    const { data } = await axios.post(
      `${this._stanEndpoint}/train`,
      trainInput
    );

    const { modelId } = data;
    this._modelId = modelId;
    return this._waitForTraining(modelId, loggingCb);
  }

  public async predict(
    text: string
  ): Promise<{ success: boolean; prediction: BpPredictOutput }> {
    const { data } = await axios.post(
      `${this._stanEndpoint}/predict/${this._modelId}`,
      {
        sentence: text,
        password: this._password,
      }
    );
    return data;
  }
}
