export default {
  extends: ['@commitlint/config-conventional'],
  ignores: [(commit) => commit.trim() === 'Initial plan'],
  rules: {
    'body-max-line-length': [1, 'always', 200],
  },
};
