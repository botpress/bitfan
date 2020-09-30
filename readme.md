## BITFAN

**Botpress Independent Testing Framework for Algorithms of NLU**

Bitfan is a nodejs framework/ library that contains multiple builtin functions to benchmark Botpress NLU or any custom NLU implementation.

Bitfan allows the user to solve `Problems`:

```ts
interface Problem<T extends ProblemType> {
  name: string; // name of the problem for logging purposes
  type: ProblemType; // type of the problem
  trainSet: DataSet<T>;
  testSet: DataSet<T>;
  lang: string;
  cb: ProblemCb<T>; // cb func to visualize results
}
```

A problem is mostly defined by a `type`, a train set and a test set.

What are problem types? Problem types can refer to any of theses:

```ts
type ProblemType =
  | "oos" // out of scope
  | "context"
  | "context-oos"
  | "intent"
  | "intent-oos" // either predicting an intent or oos
  | "slot"
  | "lang" // identifying the user language
  | "spell"; // spelling correction of user language
```

For instance, a problem of type `Problem<"slot">` contains a train set and a test set of type `DataSet<"slot">` which itself has for label an array of `{ name: string; start: number; end: number }`. A dataset of type `DataSet<"context">` however has for label a `string` representing the expected context.

To try solving a `Problem`, a user must define a `Solution` and run his solution using the `runSolution` function.

```ts
interface Solution<T extends ProblemType> {
  problems: Problem<T>[];
  engine: Engine<T>; // actual classifier that solves problems of type T
  metrics: Metric<T>[]; // metric that outputs a score between 0 and 1 for a given test (row)
}

function runSolution<T extends ProblemType>(
  solution: Solution<T>,
  seed: number
): Promise<void>;
```

The `Engine` abstraction is also specific to one problem type. It stands for the actual classifier implementation that predicts a label for a given text input.

```ts
interface Engine<T extends ProblemType> {
  train: (trainSet: DataSet<T>, seed: number) => Promise<void>;
  predict: (testSet: DataSet<T>) => Promise<Result<T>[]>;
}
```

The `Metric` abstraction exists because `Engine`s are not responsible for electing a label. All they do is outputing a language comprehension datastructure. For instance an `Engine<"oos">` prediction outputs a number reprensenting the confidence that the input is out of scope. A `Metric<"oos">` is then responsible for mapping this confidence to a score. Does an oos confidence of 0.2 should be considered as a failed test, a passed test or maybe something in between?

```ts
interface Metric<T extends ProblemType> {
  name: string;
  eval(res: Result<T>): number;
}
```

Bitfan is shipped with builtin `datasets`, `metrics` and `engine`, but any user is also free to implement his own custom code injection point.

Here's a full example:

```ts
import bitfan, { Problem, Result, Solution } from "bitfan";

const problem = {
  name: `bpds regression A`,
  type: "intent-oos",
  trainSet: bitfan.datasets.bpds.regression.train.A,
  testSet: bitfan.datasets.bpds.regression.test.A,
  lang: "en",
  cb: async (
    results: Result<"intent-oos">[],
    metrics: { [metric: string]: number }
  ) => {}, // implement this to visualize data after problem has run
};

const problems = [problem];

const stanEndpoint = "http://localhost:3200";
const password = "123456";
const engine = new bitfan.engines.BpIntentOOSEngine(stanEndpoint, password);

const metrics = [bitfan.metrics.binaryIntentScore];
const solution: Solution<"intent-oos"> = { problems, engine, metrics };

async function main() {
  for (const seed of [42, 666]) {
    console.log(`Running solution with seed ${seed}`);
    await bitfan.runSolution(solution, seed);
  }
}
main().then(() => {});
```
