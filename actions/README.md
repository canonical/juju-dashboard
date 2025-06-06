# Juju Dashboard TypeScript Actions

Juju Dashboard contains a number of TypeScript GitHub actions, in order to facilitate certain
workflows which are too complex to effectively express with YAML action syntax. These actions are
all contained in the `/actions` directory, with each individual action residing under
`/actions/src/{action_name}`.

Due to a limitation with GitHub actions, the entire action and its dependencies must be bundled in
the repository where the action is stored, it's not possible to install dependencies whilst running
the action. To automate this process, the [build script] will iterate over all of the available
actions, bundle each with their dependencies using [`ncc`], and copy the bundled code (along with
other metadata files such as `README.md` and `action.yaml`) into the corresponding [action
directory]. These built files **must** be committed in order to use them in CI.

> [!important]
> Do not directly edit any of the actions in the [action directory], as they may be overwritten at
> any time.

## Creating a new action

1. Create a new directory matching the action name under `/actions/src`.

2. Add the following files:

  - `README.md`: Readme file for the action, which should describe what it does, as well as an
    explaination of its inputs and outputs for users.

  - `main.ts`: Must export a `run` function, which should start the action.

  - `index.ts`: Entrypoint for the action. Generally, it should just call the `run` function within
    `main.ts`.

  - `action.yaml`: [Action metadata].

3. Add the action name to the `ACTIONS` array in the [build script].

4. Update `.github/workflows/tiobe_archive.txt` and include the path to the generated action under
  `GENERATED_FILE`.

## Testing actions

Vitest is configured for these actions, and can be invoked with `yarn test`. Any `.test.ts` file
will be evaluated, so unit tests can be created as desired.

[`@github/local-action`] is also available to mock the action environment, and perform end-to-end
tests. This can be invoked with `yarn run-action {action-name}`.

[Action metadata]: https://docs.github.com/en/actions/sharing-automations/creating-actions/metadata-syntax-for-github-actions
[build script]: ./scripts/build.sh
[`ncc`]: https://github.com/vercel/ncc
[action directory]: ../.github/actions
[`@github/local-action`]: https://github.com/github/local-action
