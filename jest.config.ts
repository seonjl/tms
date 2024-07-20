import type { JestConfigWithTsJest } from "ts-jest";
export default async (): Promise<JestConfigWithTsJest> => {
  return {
    modulePaths: ["<rootDir>"],
    moduleFileExtensions: ["js", "json", "ts"],
    preset: "ts-jest",
    testEnvironment: "jest-environment-node",
    collectCoverageFrom: ["functions/**/*.(t|j)s", "shared/**/*.(t|j)s"],
    coverageDirectory: "../coverage",
    roots: ["<rootDir>"],
    extensionsToTreatAsEsm: [".ts"],
    transform: {
      "^.+\\.[jt]sx?$": [
        "ts-jest",
        {
          useESM: true,
        },
      ],
    },
    moduleNameMapper: {
      "(.+)\\.js": "$1",
    },
    verbose: true,
    setupFiles: ["<rootDir>/.jest/setup.ts"],
  };
};
