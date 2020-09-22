import * as sdk from "bitfan";

const impl: typeof sdk = {
  registerTrainSet: (set: sdk.TrainSet) => {
    console.log(set);
  },
  registerTestSet: (set: sdk.TestSet) => {
    console.log(set);
  },
  registerProblem: (problem: sdk.Problem) => {
    console.log(problem);
  },
  runSolution: (solution: sdk.Solution) => {
    console.log(solution);
  },
};

export default impl;
