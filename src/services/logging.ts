import _ from "lodash";

/**
 * could have been named transposeTable
 */
export const flipTable = (table: _.Dictionary<_.Dictionary<number>>) => {
  const columns = Object.keys(table);

  let rows: string[] = [];
  for (const col of columns) {
    rows = [...rows, ...Object.keys(table[col])];
  }
  rows = _.uniq(rows);

  const flipped = _.zipObject(
    rows,
    rows.map((r) => ({}))
  );

  for (const row of rows) {
    flipped[row] = _.zipObject(
      columns,
      columns.map((c) => table[c][row])
    );
  }

  return flipped;
};

export const roundNumbers = (table: _.Dictionary<number>, precision = 4) => {
  return _.mapValues(table, (v) => (_.isNumber(v) ? _.round(v, precision) : v));
};
