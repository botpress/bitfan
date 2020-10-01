import { Metric, Problem, ProblemType } from "bitfan/sdk";
import _ from "lodash";

export class MetricHolder<T extends ProblemType> {
  private _byProblems: { [problem: string]: ByMetric } = {};

  constructor(private _metrics: Metric<T>[]) {}

  get metrics() {
    return this._metrics;
  }

  static empty<T extends ProblemType>(
    problems: Problem<T>[],
    metrics: Metric<T>[]
  ) {
    const problemNames = problems.map((p) => p.name);
    const newHolder = new MetricHolder(metrics);
    newHolder._byProblems = _.zipObject(
      problemNames,
      problemNames.map((p) => ByMetric.empty(metrics))
    );
    return newHolder;
  }

  static mergeWith<T extends ProblemType>(
    holder1: MetricHolder<T>,
    holder2: MetricHolder<T>
  ): MetricHolder<T> {
    const allProblems = _.uniq([
      ...Object.keys(holder1._byProblems),
      ...Object.keys(holder2._byProblems),
    ]);

    const newByProblem: { [problem: string]: ByMetric } = {};

    for (const prob of allProblems) {
      if (!!holder1._byProblems[prob] && !!holder2._byProblems[prob]) {
        newByProblem[prob] = ByMetric.merge(
          holder1._byProblems[prob],
          holder2._byProblems[prob]
        );
      } else if (!!holder1._byProblems[prob]) {
        newByProblem[prob] = holder1._byProblems[prob];
      } else {
        newByProblem[prob] = holder2._byProblems[prob];
      }
    }

    const newHolder = new MetricHolder(holder1._metrics);
    newHolder._byProblems = newByProblem;
    return newHolder;
  }

  public mergeWith(other: MetricHolder<T>): MetricHolder<T> {
    return MetricHolder.mergeWith(this, other);
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
    const emptyByMetric = ByMetric.empty(this._metrics);
    return Object.values(this._byProblems).reduce(
      (acc, curr) => acc.merge(curr),
      emptyByMetric
    );
  }
}

class ByMetric {
  static empty<T extends ProblemType>(metrics: Metric<T>[]): ByMetric {
    const metricsNames = metrics.map((m) => m.name);
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
