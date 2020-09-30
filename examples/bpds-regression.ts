import bitfan, { Problem, Solution } from "bitfan";

type BpdsTopics = "A" | "B" | "C" | "D" | "E" | "F";

function makeProblem(topic: BpdsTopics): Problem<"intent"> {
  return {
    name: `bpds regression ${topic}`,
    type: "intent",
    trainSet: bitfan.datasets.bpds.regression.train[topic],
    testSet: bitfan.datasets.bpds.regression.test[topic],
    lang: "en",
  };
}

const allTopics: BpdsTopics[] = ["A", "B", "C", "D", "E", "F"];
const problems = allTopics.map(makeProblem);

const stanEndpoint = "http://localhost:3200";
const password = "123456";
const engine = new bitfan.engines.BpIntentEngine(stanEndpoint, password);

const metrics = [
  bitfan.metrics.mostConfidentBinaryScore,
  bitfan.metrics.oosBinaryScore,
];
const solution: Solution<"intent"> = {
  name: "bpds regression",
  problems,
  engine,
  metrics,
  cb: bitfan.visualisation.showOOSConfusion,
};

async function main() {
  for (const seed of [42, 69]) {
    await bitfan.runSolution(solution, seed);
  }
}
main().then(() => {});
