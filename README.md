# Client-side of my personal finance app

## Agent workflow

Labeling an issue with `agent:todo` runs the Claude agent on it (`.github/workflows/agent-trigger.yml`; the logic lives in [ArthurWerle/ai-internal](https://github.com/ArthurWerle/ai-internal)).

Labels:
- `agent:todo` - queued; applying it triggers the agent.
- `agent:in-progress` - the agent is working on the issue.
- `agent:pr-open` - the agent opened a PR (with `Closes #N`) and awaits review.
- `agent:blocked` - the agent needs input; it commented with questions or the blocker.
- `agent:waiting-dep` - waiting on issues in other repos; re-queued once they are closed.
- `agent:auto` - when added together with `agent:todo`, a reviewer agent reviews the PR, approves it and merges it automatically once CI is green.

Cross-repo changes are delegated by opening `agent:todo` issues in the other repo.