import { Metric, Problem, ProblemType } from "bitfan/sdk";
import _ from "lodash";

export class MetricHolder<T extends ProblemType> {
  private _byProblems: { [problem: string]: ByMetric } = {};

  constructor(private _metrics: Metric<T>[]) {}

  get names() {
    return this._metrics.map((m) => m.name);
  }

  public setScoresForProblem(
    problem: Problem<T>,
    scores: _.Dictionary<number[]>
  ) {
    this._byProblems[problem.name] = new ByMetric(scores);
  }

  public getAvgForProblem(problem: Problem<T>): _.Dictionary<number> {
    return this._byProblems[problem.name].avg;
  }

  public getAvg(): _.Dictionary<number> {
    return this._mergeAll().avg;
  }

  private _mergeAll() {
    const emptyByMetric = ByMetric.empty(this.names);
    return Object.values(this._byProblems).reduce(
      (acc, curr) => acc.merge(curr),
      emptyByMetric
    );
  }
}

class ByMetric {
  static empty(metricsNames: string[]): ByMetric {
    return new ByMetric(
      _.zipObject(
        metricsNames,
        metricsNames.map(() => [])
      )
    );
  }

  static merge(byMetric1: ByMetric, byMetric2: ByMetric): ByMetric {
    const newScoreByMetrics = { ...byMetric1._scoresByMetrics };

    for (const metric in byMetric1._scoresByMetrics) {
      newScoreByMetrics[metric] = [
        ...byMetric1._scoresByMetrics[metric],
        ...byMetric2._scoresByMetrics[metric],
      ];
    }

    return new ByMetric(newScoreByMetrics);
  }

  constructor(private _scoresByMetrics: _.Dictionary<number[]>) {}

  public merge(other: ByMetric): ByMetric {
    return ByMetric.merge(this, other);
  }

  public get avg() {
    return _.mapValues(
      this._scoresByMetrics,
      (scores) => _.sum(scores) / scores.length
    );
  }
}
