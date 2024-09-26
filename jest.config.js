export default {
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.app.json" }],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testMatch: ["**/?(*.)+(spec|test).[tj]s?(x)"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^lodash-es$": "lodash",
  },
};
