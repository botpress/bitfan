## BITFAN

**Botpress Independent Testing Framework for Algorithms of NLU**

Bitfan is a nodejs framework/ library that contains multiple builtin functions to benchmark Botpress NLU or any custom NLU implementation.

<img  src="./bitfan.png"/>

### Main Concepts

Bitfan allows the user to solve `Problems`:

```ts
interface Problem<T extends ProblemType> {
  name: string; // name of the problem for logging purposes
  type: ProblemType; // type of the problem
  trainSet: DataSet<T>;
  testSet: DataSet<T>;
  lang: string;
  cb: ProblemCb<T>; // cb func to visualize results of this problem
}
```

A problem is mostly defined by a `type`, a train set and a test set.

What are problem types? Problem types can refer to any of theses:

```ts
type ProblemType =
  | "intent-topic" // either predicting a pair of topic and intent or oos
  | "topic" // either predicting a topic or oos
  | "intent" // either predicting an intent or oos
  | "slot" // extract correct information from a text input
  | "lang" // identifying the user language
  | "spell"; // spelling correction of user language
```

For instance, a problem of type `Problem<"slot">` contains a train set and a test set of type `DataSet<"slot">` which itself has for label an array of `{ name: string; start: number; end: number }`. A dataset of type `DataSet<"topic">` however has for label a `string` representing the expected topic.

To try solving a `Problem`, a user must define a `Solution` and run his solution using the `runSolution` function.

```ts
interface Solution<T extends ProblemType> {
  name: string;
  problems: Problem<T>[];
  engine: Engine<T>; // actual classifier that solves problems of type T
  metrics: Metric<T>[]; // metric that outputs a score between 0 and 1 for a given test (row)
  cb: ProblemCb<T>; // cb func to visualize results of this solution
}

function runSolution<T extends ProblemType>(
  solution: Solution<T>,
  seeds: number[]
): Promise<Result<T>[]>; // returns results for all problems and all seeds
```

The `Engine` abstraction is also specific to one problem type. It stands for the actual classifier implementation that predicts a label for a given text input.

```ts
interface Engine<T extends ProblemType> {
  train: (trainSet: DataSet<T>, seed: number) => Promise<void>;
  predict: (testSet: DataSet<T>) => Promise<PredictOutput<T>[]>;
}
```

The `Metric` abstraction exists because `Engine`s are not responsible for electing a label. All they do is outputing a language comprehension datastructure. For instance an `Engine<"topic">` prediction outputs a number reprensenting the confidence that the input is a certain topic. A `Metric<"topic">` is then responsible for mapping this confidence to a score. Does a confidence of 0.2 should be considered as a failed test, a passed test or maybe something in between? That's the metric's job to find out.

```ts
interface Metric<T extends ProblemType> {
  name: string;
  eval(res: Result<T>): number;
}
```

Bitfan is shipped with builtin `datasets`, `metrics`, `engine` and `visualisation` function, but any user is also free to implement his own custom code, and pass it to injections points.

Here's a full example:

```ts
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

async function main() {
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

  const seeds = [42, 666];
  const results = await bitfan.runSolution(solution, seed);
}
main().then(() => {});
```
