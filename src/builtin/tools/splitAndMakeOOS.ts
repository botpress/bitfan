import { DataSet, IntentOrTopic, Row, tools, Label } from "bitfan/sdk";
import _ from "lodash";
import { areSame } from "../../services/labels";
import SeededLodashProvider from "../../services/seeded-lodash";

export const splitOOS: typeof tools.splitOOS = <T extends IntentOrTopic>(
  dataset: DataSet<T>,
  labels: Label<T>[]
) => {
  const { rows } = dataset;

  const rowsOfLabels = rows.filter((r) =>
    labels.some((l) => areSame(r.label, l))
  );

  const otherRows = rows.filter(
    (r) => !labels.some((l) => areSame(r.label, l))
  );

  const oosRows: Row<IntentOrTopic>[] = rowsOfLabels.map((r) => ({
    ...r,
    label: "oos",
  }));

  const inScopeSet = { ...dataset, rows: otherRows };
  const ooScopeSet = { ...dataset, rows: oosRows };

  return { inScopeSet, ooScopeSet };
};

export const pickOOS: typeof tools.pickOOS = <T extends IntentOrTopic>(
  dataset: DataSet<T>,
  oosPercent: number,
  seed: number
) => {
  const { rows } = dataset;

  const N = rows.length;
  const oosSize = oosPercent * N;

  const seededLodashProvider = new SeededLodashProvider();
  seededLodashProvider.setSeed(seed);
  const lo = seededLodashProvider.getSeededLodash();

  const allLabels = lo.uniqWith(
    rows.map((r) => r.label),
    areSame
  );
  const shuffledLabels = lo.shuffle(allLabels);

  let i = 0;
  const testRows: Row<T>[] = [];
  const pickedLabels: Label<T>[] = [];
  while (testRows.length <= oosSize) {
    const label = shuffledLabels[i++];
    const rowsOfLabel = rows.filter((r) => areSame(r.label, label));
    testRows.push(...rowsOfLabel);
    pickedLabels.push(label);
  }

  return pickedLabels;
};
