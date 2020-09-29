import bitfan, { Problem, Result, Solution } from "bitfan";

type BpdsTopics = "A" | "B" | "C" | "D" | "E" | "F";

function makeProblem(topic: BpdsTopics): Problem<"intent-oos"> {
  return {
    name: `bpds regression ${topic}`,
    type: "intent-oos",
    trainSet: bitfan.datasets.bpds.regression.train[topic],
    testSet: bitfan.datasets.bpds.regression.test[topic],
    lang: "en",
    cb: async (
      results: Result<"intent-oos">[],
      metrics: { [metric: string]: number }
    ) => {}, // implement this to visualize data after problem has run
  };
}

const allTopics: BpdsTopics[] = ["A", "B", "C", "D", "E", "F"];
const problems = allTopics.map(makeProblem);

const stanEndpoint = "http://localhost:3200";
const password = "654321";
const engine = new bitfan.engines.BpIntentOOSEngine(stanEndpoint, password);

const metrics = [bitfan.metrics.binaryIntentScore];
const solution: Solution<"intent-oos"> = { problems, engine, metrics };

async function main() {
  for (const seed of [42, 69]) {
    console.log(`Running solution with seed ${seed}`);
    await bitfan.runSolution(solution, seed);
  }
}
main().then(() => {});
