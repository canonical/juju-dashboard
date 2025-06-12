import { renderHook, waitFor } from "@testing-library/react";

import type { RelationshipTuple } from "juju/jimm/JIMMV4";
import { JIMMRelation, JIMMTarget } from "juju/jimm/JIMMV4";
import { actions as jujuActions } from "store/juju";
import type { ReBACAllowed } from "store/juju/types";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  configFactory,
  generalStateFactory,
  controllerFeaturesFactory,
  controllerFeaturesStateFactory,
  authUserInfoFactory,
} from "testing/factories/general";
import {
  rebacAllowedFactory,
  rebacRelationshipFactory,
  relationshipTupleFactory,
} from "testing/factories/juju/juju";
import { ComponentProviders, createStore } from "testing/utils";

import {
  useCheckPermissions,
  useIsJIMMAdmin,
  useAuditLogsPermitted,
  useCheckRelations,
} from "./permissions";

describe("useCheckPermissions", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com/api",
        }),
        controllerFeatures: controllerFeaturesStateFactory.build({
          "wss://example.com/api": controllerFeaturesFactory.build({
            rebac: true,
          }),
        }),
      }),
    });
  });

  it("checks relations", async () => {
    const tuple = {
      object: "user-eggman@external",
      relation: JIMMRelation.MEMBER,
      target_object: "group-admins",
    };
    const [store, actions] = createStore(state, { trackActions: true });
    renderHook(() => useCheckPermissions(tuple), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="/" store={store} />
      ),
    });
    const action = jujuActions.checkRelation({
      tuple,
      wsControllerURL: "wss://example.com/api",
    });
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) => dispatch.type === jujuActions.checkRelation.type,
        ),
      ).toMatchObject(action);
    });
  });

  it("returns the relation", async () => {
    const tuple = {
      object: "user-eggman@external",
      relation: JIMMRelation.MEMBER,
      target_object: "group-admins",
    };
    state.juju.rebac.allowed = [
      rebacAllowedFactory.build({
        tuple: tuple,
        loading: true,
        loaded: true,
        allowed: true,
      }),
    ];
    const store = createStore(state);
    const { result } = renderHook(() => useCheckPermissions(tuple), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="/" store={store} />
      ),
    });
    expect(result.current).toMatchObject({
      loading: true,
      loaded: true,
      permitted: true,
    });
  });

  it("does not try and fetch a relation if the tuple is not provided", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    renderHook(() => useCheckPermissions(), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="/" store={store} />
      ),
    });
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) => dispatch.type === jujuActions.checkRelation.type,
        ),
      ).toBeUndefined();
    });
  });

  it("does not try and fetch a relation if the tuple object has a new reference", async () => {
    const tuple = {
      object: "user-eggman@external",
      relation: JIMMRelation.MEMBER,
      target_object: "group-admins",
    };
    const [store, actions] = createStore(state, { trackActions: true });
    const { rerender } = renderHook(() => useCheckPermissions(tuple), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="/" store={store} />
      ),
    });
    await waitFor(() => {
      expect(
        actions.filter(
          (dispatch) => dispatch.type === jujuActions.checkRelation.type,
        ),
      ).toHaveLength(1);
    });
    rerender({ ...tuple });
    await waitFor(() => {
      expect(
        actions.filter(
          (dispatch) => dispatch.type === jujuActions.checkRelation.type,
        ),
      ).toHaveLength(1);
    });
  });

  it("does not fetch a relation that is already loading", async () => {
    const tuple = {
      object: "user-eggman@external",
      relation: JIMMRelation.MEMBER,
      target_object: "group-admins",
    };
    state.juju.rebac.allowed = [
      rebacAllowedFactory.build({
        tuple: tuple,
        loading: true,
      }),
    ];
    const [store, actions] = createStore(state, { trackActions: true });
    renderHook(() => useCheckPermissions(tuple), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="/" store={store} />
      ),
    });
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) => dispatch.type === jujuActions.checkRelation.type,
        ),
      ).toBeUndefined();
    });
  });

  it("does not fetch a relation that has already loaded", async () => {
    const tuple = {
      object: "user-eggman@external",
      relation: JIMMRelation.MEMBER,
      target_object: "group-admins",
    };
    state.juju.rebac.allowed = [
      rebacAllowedFactory.build({
        tuple: tuple,
        loaded: true,
      }),
    ];
    const [store, actions] = createStore(state, { trackActions: true });
    renderHook(() => useCheckPermissions(tuple), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="/" store={store} />
      ),
    });
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) => dispatch.type === jujuActions.checkRelation.type,
        ),
      ).toBeUndefined();
    });
  });

  it("cleans up a previous relation if the tuple changes", async () => {
    const tuple = {
      object: "user-eggman@external",
      relation: JIMMRelation.MEMBER,
      target_object: "group-admins",
    };
    state.juju.rebac.allowed = [
      rebacAllowedFactory.build({
        tuple: tuple,
        loaded: true,
      }),
    ];
    const [store, actions] = createStore(state, { trackActions: true });
    const { rerender } = renderHook<
      {
        permitted: boolean;
        loading: boolean;
        loaded: boolean;
      },
      {
        tupleObject: RelationshipTuple;
        cleanup: boolean;
      }
    >(
      ({ tupleObject, cleanup } = { tupleObject: tuple, cleanup: true }) =>
        useCheckPermissions(tupleObject, cleanup),
      {
        wrapper: (props) => (
          <ComponentProviders {...props} path="/" store={store} />
        ),
      },
    );
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) => dispatch.type === jujuActions.checkRelation.type,
        ),
      ).toBeUndefined();
    });
    rerender({ tupleObject: { ...tuple, object: "newobject" }, cleanup: true });
    const action = jujuActions.removeCheckRelation({
      tuple,
    });
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) => dispatch.type === jujuActions.removeCheckRelation.type,
        ),
      ).toMatchObject(action);
    });
  });

  it("can clean up a relation", async () => {
    const tuple = {
      object: "user-eggman@external",
      relation: JIMMRelation.MEMBER,
      target_object: "group-admins",
    };
    state.juju.rebac.allowed = [
      rebacAllowedFactory.build({
        tuple: tuple,
        loaded: true,
      }),
    ];
    const [store, actions] = createStore(state, { trackActions: true });
    const { unmount } = renderHook(() => useCheckPermissions(tuple, true), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="/" store={store} />
      ),
    });
    const action = jujuActions.removeCheckRelation({
      tuple,
    });
    unmount();
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) => dispatch.type === jujuActions.removeCheckRelation.type,
        ),
      ).toMatchObject(action);
    });
  });

  it("does not fetch a relation if rebac is not enabled", async () => {
    const tuple = {
      object: "user-eggman@external",
      relation: JIMMRelation.MEMBER,
      target_object: "group-admins",
    };
    state.general.controllerFeatures = controllerFeaturesStateFactory.build({
      "wss://example.com/api": controllerFeaturesFactory.build({
        rebac: false,
      }),
    });
    const [store, actions] = createStore(state, { trackActions: true });
    renderHook(() => useCheckPermissions(tuple), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="/" store={store} />
      ),
    });
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) => dispatch.type === jujuActions.checkRelation.type,
        ),
      ).toBeUndefined();
    });
  });
});

describe("useIsJIMMAdmin", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com/api",
        }),
        controllerConnections: {
          "wss://example.com/api": {
            user: authUserInfoFactory.build(),
          },
        },
        controllerFeatures: controllerFeaturesStateFactory.build({
          "wss://example.com/api": controllerFeaturesFactory.build({
            rebac: true,
          }),
        }),
      }),
    });
  });

  it("checks the relation", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    renderHook(() => useIsJIMMAdmin(), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="/" store={store} />
      ),
    });
    const action = jujuActions.checkRelation({
      tuple: {
        object: "user-eggman@external",
        relation: JIMMRelation.ADMINISTRATOR,
        target_object: JIMMTarget.JIMM_CONTROLLER,
      },
      wsControllerURL: "wss://example.com/api",
    });
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) => dispatch.type === jujuActions.checkRelation.type,
        ),
      ).toMatchObject(action);
    });
  });

  it("returns the relation", async () => {
    const tuple = {
      object: "user-eggman@external",
      relation: JIMMRelation.ADMINISTRATOR,
      target_object: JIMMTarget.JIMM_CONTROLLER,
    };
    state.juju.rebac.allowed = [
      rebacAllowedFactory.build({
        tuple: tuple,
        loading: true,
        loaded: true,
        allowed: true,
      }),
    ];
    const store = createStore(state);
    const { result } = renderHook(() => useIsJIMMAdmin(), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="/" store={store} />
      ),
    });
    expect(result.current).toMatchObject({
      loading: true,
      loaded: true,
      permitted: true,
    });
  });

  it("does not try and fetch the relation if the user is not found", async () => {
    state.general.controllerConnections = {};
    const [store, actions] = createStore(state, { trackActions: true });
    renderHook(() => useIsJIMMAdmin(), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="/" store={store} />
      ),
    });
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) => dispatch.type === jujuActions.checkRelation.type,
        ),
      ).toBeUndefined();
    });
  });

  it("can clean up the relation", async () => {
    const tuple = {
      object: "user-eggman@external",
      relation: JIMMRelation.ADMINISTRATOR,
      target_object: JIMMTarget.JIMM_CONTROLLER,
    };
    state.juju.rebac.allowed = [
      rebacAllowedFactory.build({
        tuple: tuple,
        loaded: true,
      }),
    ];
    const [store, actions] = createStore(state, { trackActions: true });
    const { unmount } = renderHook(() => useIsJIMMAdmin(true), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="/" store={store} />
      ),
    });
    const action = jujuActions.removeCheckRelation({
      tuple,
    });
    unmount();
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) => dispatch.type === jujuActions.removeCheckRelation.type,
        ),
      ).toMatchObject(action);
    });
  });
});

describe("useAuditLogsPermitted", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com/api",
        }),
        controllerConnections: {
          "wss://example.com/api": {
            user: authUserInfoFactory.build(),
          },
        },
        controllerFeatures: controllerFeaturesStateFactory.build({
          "wss://example.com/api": controllerFeaturesFactory.build({
            rebac: true,
            auditLogs: true,
          }),
        }),
      }),
    });
  });

  it("checks the relation", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    renderHook(() => useAuditLogsPermitted(), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="/" store={store} />
      ),
    });
    const auditLogAction = jujuActions.checkRelation({
      tuple: {
        object: "user-eggman@external",
        relation: JIMMRelation.AUDIT_LOG_VIEWER,
        target_object: JIMMTarget.JIMM_CONTROLLER,
      },
      wsControllerURL: "wss://example.com/api",
    });
    const adminAction = jujuActions.checkRelation({
      tuple: {
        object: "user-eggman@external",
        relation: JIMMRelation.ADMINISTRATOR,
        target_object: JIMMTarget.JIMM_CONTROLLER,
      },
      wsControllerURL: "wss://example.com/api",
    });
    await waitFor(() => {
      const dispatched = actions.filter(
        (dispatch) => dispatch.type === jujuActions.checkRelation.type,
      );
      expect(dispatched).toEqual(
        expect.arrayContaining([adminAction, auditLogAction]),
      );
    });
  });

  it("returns the relation", async () => {
    const tuple = {
      object: "user-eggman@external",
      relation: JIMMRelation.AUDIT_LOG_VIEWER,
      target_object: JIMMTarget.JIMM_CONTROLLER,
    };
    state.juju.rebac.allowed = [
      rebacAllowedFactory.build({
        tuple: tuple,
        loading: true,
        loaded: true,
        allowed: true,
      }),
      rebacAllowedFactory.build({
        tuple: {
          object: "user-eggman@external",
          relation: JIMMRelation.ADMINISTRATOR,
          target_object: JIMMTarget.JIMM_CONTROLLER,
        },
        loading: true,
        loaded: true,
        allowed: true,
      }),
    ];
    const store = createStore(state);
    const { result } = renderHook(() => useAuditLogsPermitted(), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="/" store={store} />
      ),
    });
    expect(result.current).toMatchObject({
      loading: true,
      loaded: true,
      permitted: true,
    });
  });

  it("does not try and fetch the relation if the user is not found", async () => {
    state.general.controllerConnections = {};
    const [store, actions] = createStore(state, { trackActions: true });
    renderHook(() => useAuditLogsPermitted(), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="/" store={store} />
      ),
    });
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) => dispatch.type === jujuActions.checkRelation.type,
        ),
      ).toBeUndefined();
    });
  });

  it("does not try and fetch the relation if audit logs are not enabled", async () => {
    state.general.controllerFeatures = controllerFeaturesStateFactory.build({
      "wss://example.com/api": controllerFeaturesFactory.build({
        rebac: true,
        auditLogs: false,
      }),
    });
    const [store, actions] = createStore(state, { trackActions: true });
    renderHook(() => useAuditLogsPermitted(), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="/" store={store} />
      ),
    });
    const auditLogAction = jujuActions.checkRelation({
      tuple: {
        object: "user-eggman@external",
        relation: JIMMRelation.AUDIT_LOG_VIEWER,
        target_object: JIMMTarget.JIMM_CONTROLLER,
      },
      wsControllerURL: "wss://example.com/api",
    });
    await waitFor(() => {
      const dispatched = actions.filter(
        (dispatch) => dispatch.type === jujuActions.checkRelation.type,
      );
      expect(dispatched).not.toEqual(expect.arrayContaining([auditLogAction]));
    });
  });

  it("can clean up the relation", async () => {
    const tuple = {
      object: "user-eggman@external",
      relation: JIMMRelation.AUDIT_LOG_VIEWER,
      target_object: JIMMTarget.JIMM_CONTROLLER,
    };
    state.juju.rebac.allowed = [
      rebacAllowedFactory.build({
        tuple: tuple,
        loaded: true,
      }),
    ];
    const [store, actions] = createStore(state, { trackActions: true });
    const { unmount } = renderHook(() => useAuditLogsPermitted(true), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="/" store={store} />
      ),
    });
    unmount();
    const auditLogAction = jujuActions.removeCheckRelation({
      tuple: {
        object: "user-eggman@external",
        relation: JIMMRelation.AUDIT_LOG_VIEWER,
        target_object: JIMMTarget.JIMM_CONTROLLER,
      },
    });
    const adminAction = jujuActions.removeCheckRelation({
      tuple: {
        object: "user-eggman@external",
        relation: JIMMRelation.ADMINISTRATOR,
        target_object: JIMMTarget.JIMM_CONTROLLER,
      },
    });
    await waitFor(() => {
      const dispatched = actions.filter(
        (dispatch) => dispatch.type === jujuActions.removeCheckRelation.type,
      );
      expect(dispatched).toEqual(
        expect.arrayContaining([adminAction, auditLogAction]),
      );
    });
  });
});

describe("useCheckRelations", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com/api",
        }),
        controllerFeatures: controllerFeaturesStateFactory.build({
          "wss://example.com/api": controllerFeaturesFactory.build({
            rebac: true,
          }),
        }),
      }),
    });
  });

  it("fetches relationships", async () => {
    const requestId = "123456";
    const tuples = [relationshipTupleFactory.build()];
    const [store, actions] = createStore(state, { trackActions: true });
    renderHook(() => useCheckRelations(requestId, tuples), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="/" store={store} />
      ),
    });
    const action = jujuActions.checkRelations({
      requestId,
      tuples,
      wsControllerURL: "wss://example.com/api",
    });
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) => dispatch.type === jujuActions.checkRelations.type,
        ),
      ).toMatchObject(action);
    });
  });

  it("returns the relationships", async () => {
    const requestId = "1234567";
    const tuples = [
      relationshipTupleFactory.build({
        object: "user-eggman@external",
        target_object: "group-admins",
      }),
      relationshipTupleFactory.build({
        object: "user-eggman@external",
        target_object: "group-readers",
      }),
    ];
    const relationships = rebacRelationshipFactory.build({
      loading: true,
      loaded: true,
      requestId,
    });

    const allowed = [
      rebacAllowedFactory.build({
        tuple: tuples[0],
        loading: true,
        loaded: true,
        allowed: true,
      }),
      rebacAllowedFactory.build({
        tuple: tuples[1],
        loading: false,
        loaded: true,
        allowed: false,
      }),
    ];
    state.juju.rebac.allowed = allowed;
    state.juju.rebac.relationships = [relationships];
    const store = createStore(state);
    const { result } = renderHook(() => useCheckRelations(requestId, tuples), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="/" store={store} />
      ),
    });
    expect(result.current).toMatchObject({
      loading: true,
      loaded: true,
      permissions: allowed,
    });
  });

  it("does not try and fetch the relationships if the tuples are not provided", async () => {
    const requestId = "12345";
    const [store, actions] = createStore(state, { trackActions: true });
    renderHook(() => useCheckRelations(requestId), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="/" store={store} />
      ),
    });
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) => dispatch.type === jujuActions.checkRelations.type,
        ),
      ).toBeUndefined();
    });
  });

  it("does not try and fetch the relationships if the tuples array has a new reference", async () => {
    const requestId = "12345";
    const tuples = [
      relationshipTupleFactory.build({
        object: "user-eggman@external",
        target_object: "group-admins",
      }),
      relationshipTupleFactory.build({
        object: "user-eggman@external",
        target_object: "group-readers",
      }),
    ];
    const [store, actions] = createStore(state, { trackActions: true });
    const { rerender } = renderHook(
      () => useCheckRelations(requestId, tuples),
      {
        wrapper: (props) => (
          <ComponentProviders {...props} path="/" store={store} />
        ),
      },
    );
    await waitFor(() => {
      expect(
        actions.filter(
          (dispatch) => dispatch.type === jujuActions.checkRelations.type,
        ),
      ).toHaveLength(1);
    });
    rerender([...tuples]);
    await waitFor(() => {
      expect(
        actions.filter(
          (dispatch) => dispatch.type === jujuActions.checkRelations.type,
        ),
      ).toHaveLength(1);
    });
  });

  it("does not fetch the relationships that are already loading", async () => {
    const requestId = "12345";
    const tuples = [
      relationshipTupleFactory.build({
        object: "user-eggman@external",
        target_object: "group-admins",
      }),
      relationshipTupleFactory.build({
        object: "user-eggman@external",
        target_object: "group-readers",
      }),
    ];
    const relationships = rebacRelationshipFactory.build({
      requestId,
      loading: true,
    });
    state.juju.rebac.relationships = [relationships];
    const [store, actions] = createStore(state, { trackActions: true });
    renderHook(() => useCheckRelations(requestId, tuples), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="/" store={store} />
      ),
    });
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) => dispatch.type === jujuActions.checkRelations.type,
        ),
      ).toBeUndefined();
    });
  });

  it("does not fetch the relationships that have already loaded", async () => {
    const requestId = "12345";
    const tuples = [
      relationshipTupleFactory.build({
        object: "user-eggman@external",
        target_object: "group-admins",
      }),
      relationshipTupleFactory.build({
        object: "user-eggman@external",
        target_object: "group-readers",
      }),
    ];
    const relationships = rebacRelationshipFactory.build({
      requestId,
      loaded: true,
    });
    state.juju.rebac.relationships = [relationships];
    const [store, actions] = createStore(state, { trackActions: true });
    renderHook(() => useCheckRelations(requestId, tuples), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="/" store={store} />
      ),
    });
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) => dispatch.type === jujuActions.checkRelations.type,
        ),
      ).toBeUndefined();
    });
  });

  it("cleans up previous relationships if the tuple changes", async () => {
    const requestId = "12345";
    const tuples = [
      relationshipTupleFactory.build({
        object: "user-eggman@external",
        target_object: "group-admins",
      }),
      relationshipTupleFactory.build({
        object: "user-eggman@external",
        target_object: "group-readers",
      }),
    ];
    const relationships = rebacRelationshipFactory.build({
      requestId,
      loaded: true,
    });
    state.juju.rebac.relationships = [relationships];
    const [store, actions] = createStore(state, { trackActions: true });
    const { rerender } = renderHook<
      {
        permissions?: ReBACAllowed[] | null;
        loading: boolean;
        loaded: boolean;
      },
      {
        tuplesList: RelationshipTuple[];
        cleanup: boolean;
      }
    >(
      ({ tuplesList, cleanup } = { tuplesList: tuples, cleanup: true }) =>
        useCheckRelations(requestId, tuplesList, cleanup),
      {
        wrapper: (props) => (
          <ComponentProviders {...props} path="/" store={store} />
        ),
      },
    );
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) => dispatch.type === jujuActions.checkRelations.type,
        ),
      ).toBeUndefined();
    });
    rerender({
      tuplesList: [
        ...tuples,
        relationshipTupleFactory.build({
          object: "user-eggman@external",
          target_object: "mode-8910",
        }),
      ],
      cleanup: true,
    });
    const action = jujuActions.removeCheckRelations({
      requestId,
    });
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) => dispatch.type === jujuActions.removeCheckRelations.type,
        ),
      ).toMatchObject(action);
    });
  });

  it("can clean up on unmount", async () => {
    const requestId = "56789";
    const tuples = [
      relationshipTupleFactory.build({
        object: "user-eggman@external",
        target_object: "group-admins",
      }),
      relationshipTupleFactory.build({
        object: "user-eggman@external",
        target_object: "group-readers",
      }),
    ];
    const relationships = rebacRelationshipFactory.build({
      requestId,
      loaded: true,
    });
    state.juju.rebac.relationships = [relationships];
    const [store, actions] = createStore(state, { trackActions: true });
    const { unmount } = renderHook(
      () => useCheckRelations(requestId, tuples, true),
      {
        wrapper: (props) => (
          <ComponentProviders {...props} path="/" store={store} />
        ),
      },
    );
    const action = jujuActions.removeCheckRelations({
      requestId,
    });
    unmount();
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) => dispatch.type === jujuActions.removeCheckRelations.type,
        ),
      ).toMatchObject(action);
    });
  });

  it("does not fetch the relationships if rebac is not enabled", async () => {
    const requestId = "12345";
    const tuples = [
      relationshipTupleFactory.build({
        object: "user-eggman@external",
        target_object: "group-admins",
      }),
      relationshipTupleFactory.build({
        object: "user-eggman@external",
        target_object: "group-readers",
      }),
    ];
    state.general.controllerFeatures = controllerFeaturesStateFactory.build({
      "wss://example.com/api": controllerFeaturesFactory.build({
        rebac: false,
      }),
    });
    const [store, actions] = createStore(state, { trackActions: true });
    renderHook(() => useCheckRelations(requestId, tuples), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="/" store={store} />
      ),
    });
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) => dispatch.type === jujuActions.checkRelations.type,
        ),
      ).toBeUndefined();
    });
  });
});
