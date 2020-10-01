import { Metric, Problem, ProblemType } from "bitfan/sdk";
import _ from "lodash";
import { MetricHolder } from "./metricHolder";

export class SolutionMetricHolder<T extends ProblemType> {
  private _bySeed: { [seed: number]: MetricHolder<T> } = {};

  constructor(private _problems: Problem<T>[], private _metrics: Metric<T>[]) {}

  public setScoresForSeed(seed: number, scores: MetricHolder<T>) {
    this._bySeed[seed] = scores;
  }

  public getAvg(): _.Dictionary<number> {
    return this._mergeAll().getAvg();
  }

  private _mergeAll(): MetricHolder<T> {
    return Object.values(this._bySeed).reduce(
      (acc, curr) => acc.mergeWith(curr),
      MetricHolder.empty(this._problems, this._metrics)
    );
  }
}
