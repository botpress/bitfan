import bitfan, { Problem, Solution } from "bitfan";

type BpdsTopics = "A" | "B" | "C" | "D" | "E" | "F";

const makeProblem = (topic: BpdsTopics): Problem<"intent"> => {
  return {
    name: `bpds regression ${topic}`,
    type: "intent",
    trainSet: bitfan.datasets.bpds.regression.train[topic],
    testSet: bitfan.datasets.bpds.regression.test[topic],
    lang: "en",
  };
};

export default async function main() {
  const allTopics: BpdsTopics[] = ["A", "B", "C", "D", "E", "F"];

  const metrics = [
    bitfan.metrics.mostConfidentBinaryScore,
    bitfan.metrics.oosBinaryScore,
  ];

  const problems = allTopics.map(makeProblem);

  const stanEndpoint = "http://localhost:3200";
  const password = "123456";
  const engine = new bitfan.engines.BpIntentEngine(stanEndpoint, password);

  const solution: Solution<"intent"> = {
    name: "bpds regression",
    problems,
    engine,
    metrics,
  };

  const seeds = [42, 69];
  const results = await bitfan.runSolution(solution, seeds);

  // visualise results

  const visMetricsByProblem = bitfan.visualisation.showAverageScoreByMetric(
    metrics,
    { aggregateBy: "problem" }
  );
  visMetricsByProblem(results);

  const visMetricsBySeed = bitfan.visualisation.showAverageScoreByMetric(
    metrics,
    { aggregateBy: "seed" }
  );
  visMetricsBySeed(results);

  bitfan.visualisation.showOOSConfusion(results);
}
main().then(() => {});
