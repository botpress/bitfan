import * as sdk from "src/bitfan";
import _ from "lodash";

const OOS = "oos";

export const areSame = <T extends sdk.ProblemType>(
  label1: sdk.Label<T>,
  label2: sdk.Label<T>
): boolean => {
  if (typeof label1 !== typeof label2) {
    throw new Error(
      `Both labels must share the same types.\nlabel1=${JSON.stringify(
        label1,
        undefined,
        2
      )}, label2=${JSON.stringify(label2, undefined, 2)}`
    );
  }
  if (typeof label1 === "string") {
    return label1 === label2;
  } else if (_.isArray(label1) && _.isArray(label2)) {
    return _.isEqual(label1.sort(), label2.sort());
  } else if (typeof label1 === "object") {
    return _.isEqual(label1, label2);
  }

  return false;
};

export const isOOS = <T extends sdk.ProblemType>(
  label: sdk.Label<T>
): boolean => {
  if (typeof label === "string") {
    return label === OOS;
  } else if (_.isArray(label)) {
    return label.length === 1 && label[0] === OOS;
  }
  return false;
};
