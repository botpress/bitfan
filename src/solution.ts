import * as sdk from "bitfan/sdk";
import chalk from "chalk";
import _ from "lodash";
import cliProgress from "cli-progress";

const runSolution = async <T extends sdk.ProblemType>(
  solution: sdk.Solution<T>,
  seeds: number[]
) => {
  const allResults: sdk.Result<T>[] = [];

  const runSolutionForSeed = makeSolutionRunner({ allResults }, solution);
  for (const seed of seeds) {
    await runSolutionForSeed(seed);
  }

  return allResults;
};

const makeSolutionRunner = <T extends sdk.ProblemType>(
  state: {
    allResults: sdk.Result<T>[];
  },
  solution: sdk.Solution<T>
) => async (seed: number) => {
  const { allResults } = state;

  const { name, problems } = solution;

  console.log(
    chalk.green(chalk.bold(`Running Solution ${name} with seed ${seed}`))
  );

  const solutionResults: sdk.Result<T>[] = [];

  const runProblem = makeProblemRunner({ solutionResults }, solution, seed);
  for (const problem of problems) {
    try {
      await runProblem(problem);
    } catch (err) {
      console.log(
        chalk.red(
          `The following error occured when solving problem ${problem.name} with seed ${seed}:\n${err.message}`
        )
      );
      process.exit(1);
    }
  }

  allResults.push(...solutionResults);

  if (!!solution.cb) {
    console.log(chalk.green(chalk.bold(`Results for All Problems`)));
    await solution.cb(solutionResults);
    console.log("\n");
  }
};

const makeProblemRunner = <T extends sdk.ProblemType>(
  state: {
    solutionResults: sdk.Result<T>[];
  },
  solution: sdk.Solution<T>,
  seed: number
) => async (problem: sdk.Problem<T>) => {
  const { solutionResults } = state;

  const { engine, metrics } = solution;

  console.log(chalk.green(chalk.bold(`Problem ${problem.name}`)));

  const trainProgressBar = new cliProgress.Bar({
    format: "Training: [{bar}] ({percentage}%), {duration}s",
    stream: process.stdout,
    noTTYOutput: true,
  });
  trainProgressBar.start(100, 0);

  await engine.train(problem.trainSet, seed, (p: number) => {
    if (p === 1) {
      p = 0.99;
    }
    trainProgressBar.update(p * 100);
  });
  trainProgressBar.update(100);
  trainProgressBar.stop();

  const predictProgressBar = new cliProgress.Bar({
    format: "Prediction: [{bar}] ({percentage}%), {duration}s",
    stream: process.stdout,
    noTTYOutput: true,
  });
  predictProgressBar.start(100, 0);

  const predictOutputs = await engine.predict(problem.testSet, (p: number) => {
    if (p === 1) {
      p = 0.99;
    }
    predictProgressBar.update(p * 100);
  });
  predictProgressBar.update(100);
  predictProgressBar.stop();
  console.log("");

  const results: sdk.Result<T>[] = predictOutputs.map((p) => {
    const metricsNames = metrics.map((m) => m.name);
    const metricsScores = metrics.map((m) => m.eval(p));
    return {
      ...p,
      scores: _.zipObject(metricsNames, metricsScores),
      metadata: {
        seed,
        problem: problem.name,
      },
    };
  });

  solutionResults.push(...results);

  if (!!problem.cb) {
    console.log(chalk.green(chalk.bold(`Results for Problem ${problem.name}`)));
    await problem.cb(results);
    console.log("\n");
  }
};

export default runSolution;
