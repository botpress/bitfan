import _ from "lodash";

export const initDictionnary = <T>(
  props: string[],
  valueGenerator: () => T
): _.Dictionary<T> => {
  const values: T[] = new Array<number>(props.length)
    .fill(0)
    .map(valueGenerator);
  return _.zipObject(props, values);
};
