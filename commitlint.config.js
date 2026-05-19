module.exports = {
  extends: ['@commitlint/config-conventional'],
  ignores: [
    // Ignore automated dependency bump commits from bots (e.g., Dependabot/Renovate).
    // These commits follow the conventional format but may contain long URLs in their body.
    (message) => /^(build|chore|fix)\(deps(-dev)?\): bump .+ from .+ to .+/.test(message),
  ],
};
