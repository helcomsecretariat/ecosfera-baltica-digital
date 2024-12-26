/** @type {import('i18n-unused').RunOptions} */
module.exports = {
  localesPath: "./src/locales",
  srcPath: "./src",
  srcExtensions: ["js", "ts", "jsx", "tsx"],
  localesExtensions: ["json"],
  ignoreComments: false,
  flatTranslations: false,
  translationSeparator: ".",
  context: true,
  excludeKey: ["deck.policies."],
  translationKeyMatcher: /(?:[$ .](_|t|tc|i18nKey)|\{t)\(([\n\r\s]|.)*?\)/gi,
};
