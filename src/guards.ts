import * as sdk from "bitfan/sdk";

export const isUnsupervisedSolution = <T extends sdk.ProblemType>(
  solution: sdk.Solution<T, sdk.LearningApproach>
): solution is sdk.Solution<T, "unsupervised"> => {
  return solution.problems.some(isUnsupervisedProblem);
};

export const isUnsupervisedProblem = <T extends sdk.ProblemType>(
  prob: sdk.Problem<T, sdk.LearningApproach>
): prob is sdk.Problem<T, "unsupervised"> => {
  return !!(prob as sdk.Problem<T, "unsupervised">).corpus;
};
