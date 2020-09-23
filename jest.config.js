module.exports = {
  preset: "ts-jest",
  globals: {
    "ts-jest": {
      tsConfig: "<rootDir>/tsconfig.test.json",
      diagnostics: false,
    },
  },
  testEnvironment: "node",
};
