import * as sdk from "bitfan/sdk";
import chalk from "chalk";

export const showSlotsResults: typeof sdk.metrics.showSlotsResults = async (
  results: sdk.Result<"slot">[]
) => {
  for (const res of results) {
    logResult(res);
  }
};

const logResult = (res: sdk.Result<"slot">) => {
  let expected = "";
  const isInsideExpected = _isInside(
    res.label.map((l) => ({ start: l.start, end: l.end }))
  );
  for (let i = 0; i < res.text.length; i++) {
    const char = isInsideExpected(i) ? "x" : "-";
    expected += char;
  }

  let actual = "";
  const isInsideActual = _isInside(
    Object.values(res.prediction).map((s) => ({ start: s.start, end: s.end }))
  );
  for (let i = 0; i < res.text.length; i++) {
    const char = isInsideActual(i) ? "x" : "-";
    actual += char;
  }

  console.log("expected: " + chalk.blueBright(expected));
  console.log("text:     " + res.text);
  console.log("actual:   " + chalk.yellowBright(actual));
  console.log("");
};

const _isInside = (slots: { start: number; end: number }[]) => (i: number) => {
  return slots.some((s) => s.start <= i && s.end > i);
};
