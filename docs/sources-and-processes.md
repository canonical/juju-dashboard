# Sources and Processes

The dashboard uses three Redux middleware patterns for asynchronous work:

- **Sources** - one-shot asynchronous workloads, usually a single API request. They can be started, stopped, invalidated, and report `data` / `loading` / `error` state through actions.
- **Processes** - long-running asynchronous actions that yield status updates and end with either a result or an error.
- **Model poller** - a legacy middleware implementation containing a large range of data fetching for a model. The long-term goal is to migrate components of this middleware into standalone sources and processes.

Sources live in [`src/store/middleware/source/`](../src/store/middleware/source/) and are setup by `createSourceMiddleware()`. Processes live in [`src/store/middleware/process/`](../src/store/middleware/process/) and are setup by `createMiddleware()`.

Both are built on generic helpers in [`src/store/middleware/source-middleware.ts`](../src/store/middleware/source-middleware.ts) and [`src/store/middleware/process/createProcess.ts`](../src/store/middleware/process/createProcess.ts).

## Sources

A source is a managed instance of the [`Source<T>`](../src/data/source.ts) abstraction from `src/data`. It exposes events (`data`, `error`, `load`, `loadEnd`, `errorCleared`) and middleware dispatches Redux actions when those events fire.

### Lifecycle

For each registered source the middleware creates three actions:

- `source/<id>/start` - starts the source, optionally attaching a connection from `meta.connections`.
- `source/<id>/stop` - stops and cleans up the source.
- `source/<id>/invalidate` - marks the source stale so it re-fetches.

Multiple `start` calls with the same payload return the same underlying `Source` instance, as the source is keyed by hashing its arguments.

### Implementing a source

Create a file in `src/store/middleware/source/` and export the result of `createSourceInstance`:

```ts
import { createPollingSource } from "data/pollingSource";
import { createSourceInstance } from "../source-middleware";

export default createSourceInstance<
  { wsControllerURL: string },
  CloudInfoResult
>(
  "cloud-info",
  ({ meta }) => {
    const connection = meta.connections.wsControllerURL;
    return createPollingSource(async () => fetchCloudInfo(connection), {
      interval: { seconds: 30 },
    });
  },
  {
    setData: (_, data) => jujuActions.updateCloudInfo({ update: { data } }),
    setLoading: (_, loading) =>
      jujuActions.updateCloudInfo({ update: { loading } }),
    setError: (_, error) =>
      jujuActions.updateCloudInfo({
        update: { error: toSerializableSourceError(error) },
      }),
  },
  {
    addActionMeta: () => ({ withConnection: true }),
  },
);
```

Arguments to `createSourceInstance`:

1. `identifier` - used in action types and for hashing the source arguments.
2. `createSource` - receives the payload and `meta` and must return a `Source<T>`.
3. `sourceActions` - maps source events to Redux actions:
   - `setData(args, data)`
   - `setLoading(args, loading)`
   - `setError(args, error | null)`
4. `hooks` (optional) -
   - `addActionMeta(payload)` adds values to the action's `meta`, e.g. `{ withConnection: true }` or `{ connectionList: [...] }`.
   - `after(args, store)` runs after `setData` succeeds. **Avoid depending on this**, it is intended for legacy polling migrations.

### Registering a source

Import the source in [`src/store/middleware/source/index.ts`](../src/store/middleware/source/index.ts) and add it to the array passed to `createMiddleware`.

### Using a source

Dispatch the action returned by the source instance:

```ts
import cloudInfo from "store/middleware/source/cloud-info";

dispatch(cloudInfo.actions.start({ wsControllerURL }));
```

Stop or invalidate it the same way:

```ts
dispatch(cloudInfo.actions.stop({ wsControllerURL }));
dispatch(cloudInfo.actions.invalidate({ wsControllerURL }));
```

## Processes

A process is an [`AsyncGenerator<Status, Result, void>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncGenerator). Each yielded value is a status update, the final `return` is the outcome. If the generator throws, the error is captured.

### Lifecycle

A process exposes a single action:

- `process/<id>/run` - starts the process.

The middleware invokes the generator, dispatches `setRunning(true)`, then for each result:

- `yield` -> `processActions.setStatus(payload, status)`
- `return` -> `processActions.setOutcome(payload, { result })`
- `throw` -> `processActions.setOutcome(payload, { error: { message, source } })`

Finally it dispatches `setRunning(false)` and any `after` hook.

### Implementing a process

Create a file in `src/store/middleware/process/` and export the result of `createProcess`:

```ts
import { createProcess } from "../createProcess";

type Payload = { modelUUID: string; params: BlockSwitchParams };
type Status = { status: "initiated" | "pending" };

export default createProcess<Payload, Status, void>(
  "block/disable-command",
  async function* ({ params, meta }): AsyncGenerator<Status, void, void> {
    const modelConnection = meta.connections.modelURL;
    const request = modelConnection.facades.block.switchBlockOn(params);
    yield { status: "pending" };
    const result = await request;
    if (result.error) {
      throw result.error;
    }
    yield { status: "initiated" };
  },
  {
    setStatus: (payload, status) =>
      jujuActions.setBlockStatus({ modelUUID: payload.modelUUID, status: status.status }),
    setRunning: (payload, running) =>
      jujuActions.setBlockRunning({ modelUUID: payload.modelUUID, running }),
    setOutcome: (payload, outcome) =>
      jujuActions.setBlockOutcome({ modelUUID: payload.modelUUID, outcome }),
  },
  {
    addActionMeta: () => ({ withConnection: true, connectionList: ["modelURL"] }),
  },
);
```

Arguments to `createProcess`:

1. `identifier` - used in the run action type.
2. `runProcess` - an async generator receiving the payload and `meta`.
3. `processActions` - maps process state to Redux actions:
   - `setStatus(payload, status)` (optional, return `void` to skip a status dispatch)
   - `setRunning(payload, running)`
   - `setOutcome(payload, outcome)` where `outcome` is `{ result }` or `{ error: { message, source } }`
4. `hooks` (optional)
   - `addActionMeta(payload)` adds values to `meta`.
   - `after(args, dispatch)` runs after the process finishes.

### Registering a process

Import the process in [`src/store/middleware/process/index.ts`](../src/store/middleware/process/index.ts) and add it to the array passed to `createMiddleware`.

### Using a process

Dispatch the run action:

```ts
import disableCommand from "store/middleware/process/block/disable-command";

dispatch(
  disableCommand.actions.run({
    modelUUID,
    modelURL,
    wsControllerURL,
    params,
  }),
);
```

## Connection metadata

The `meta` object on actions is populated upstream by the connection middleware. Common keys:

- `meta.connections.<name>` - an established facade connection.
- `meta.withConnection` - request for the connection middleware to attach connections.
- `meta.connectionList` - restricts which connections are injected.

Sources and processes should validate required connections with [`hasConnections(meta, [...])`](../src/store/middleware/connection/util.ts):

```ts
if (!hasConnections(meta, ["wsControllerURL", "modelURL"])) {
  throw new Error("connection not provided");
}
```

## Testing

### Source tests

Unit-test the API implementation and the middleware integration separately.

- Test the raw helper against a mocked connection, e.g. [`model-config-defaults.test.ts`](../src/store/middleware/source/model-config-defaults.test.ts).
- Test the middleware wrapper with a mocked source by constructing `createMiddleware([source])`, mocking `store`/`next`, and asserting the correct actions are dispatched. [`source-middleware.test.ts`](../src/store/middleware/source-middleware.test.ts) covers shared behaviours: start deduplication, stop, invalidate, event-to-action mapping, and multi-source isolation.

### Process tests

Mock `processActions` and `dispatch`, then call `process.start(payload, dispatch)` directly:

```ts
const processActions = {
  setStatus: vi.fn(() => ({ type: "setStatus" })),
  setRunning: vi.fn(() => ({ type: "setRunning" })),
  setOutcome: vi.fn(() => ({ type: "setOutcome" })),
};
const dispatch = vi.fn();

const process = createProcess("myProcess", runProcess, processActions);
await process.start({ value: 123, meta: {} }, dispatch);

expect(processActions.setStatus).toHaveBeenCalled();
expect(processActions.setOutcome).toHaveBeenCalledWith(
  { value: 123, meta: {} },
  { result: "result" },
);
```

See [`createProcess.test.ts`](../src/store/middleware/process/createProcess.test.ts) for the full pattern.

## When to use which

Use a **source** when you want:

- A request whose result is stored as `data` / `loading` / `error` in Redux.
- Polling or reactive data that can be stopped or invalidated.
- Multiple concurrent fetches keyed by arguments.

Use a **process** when you want:

- A stateful, long-running operation (upgrade, migration, blocking command, etc.).
- Progress/status updates delivered while the work runs.
- A clear final outcome (`result` or `error`).

## Model poller migration

The model-poller is currently broken down into a large collection of `if`/`else` statements, matching against an action dispatched into the store. Most of these actions are one-shot actions that just need access to the model connection (which was historically stored within the model poller). Now, connections are stored within the `ConnectionManager`, which is implemented as its own middleware and it injects connections into actions.

Migration can therefore operate as follows:

1. Select one of the branches from the model poller (eg. `destroyModels`).
2. Create a new process or source, depending on what is appropriate (eg. `destroyModels` should be a process).
3. Move the content of the branch into the source/process implementation (see implementation patterns above).
4. Move action boilerplate (connection checks, parameter verification, etc) into the base of the source/process.
5. Extract relevant tests from `model-poller.test.ts`, and adapt them into a source/process test.
6. Migration complete! The actual action does not need to change, so there shouldn't be a need for users of the action to change anything.
