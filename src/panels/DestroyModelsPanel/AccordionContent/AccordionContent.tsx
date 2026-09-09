import type { RemoteEndpoint } from "@canonical/jujulib/dist/api/facades/application/ApplicationV22";
import { Button, Icon, MainTable } from "@canonical/react-components";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { useMemo, type JSX } from "react";

import useModelDestructionData from "hooks/useModelDestructionData";
import { getWSControllerURL } from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import { getSelectedModelForDestruction } from "store/juju/selectors";
import { useAppDispatch, useAppSelector } from "store/store";
import filterBoolean from "utils/filterBoolean";

import { Label } from "./types";

// Helper to render the Applications
const applicationsRow = (applications: string[]): MainTableRow | null => {
  if (!applications.length) {
    return null;
  }
  return {
    columns: [
      {
        content: (
          <>
            <Icon name="applications" className="icon" />
            Applications ({applications.length})
          </>
        ),
      },
      {
        content: applications.map((app) => <div key={app}>{app}</div>),
        className: "p-table__cell--icon-placeholder",
      },
    ],
  };
};

// Helper to render the Cross-Model Relations
const crossModelRelationsRow = (
  crossModelRelations: {
    name: string;
    endpoints: RemoteEndpoint[];
    isConnectedOffer: boolean;
  }[],
): MainTableRow | null => {
  if (!crossModelRelations.length) {
    return null;
  }
  return {
    columns: [
      {
        content: (
          <>
            <Icon name="get-link" className="icon" />
            Cross-model relations ({crossModelRelations.length})
          </>
        ),
      },
      {
        content: (
          <>
            {crossModelRelations.map(
              ({ name, endpoints, isConnectedOffer }) => (
                <div key={name}>
                  {isConnectedOffer ? <Icon name="warning" /> : null}
                  {name}{" "}
                  {endpoints.map((endpoint: RemoteEndpoint, index: number) => (
                    <span key={index}>
                      {endpoint.name}:{endpoint.interface}
                    </span>
                  ))}
                </div>
              ),
            )}
          </>
        ),
        className: "p-table__cell--icon-placeholder",
      },
    ],
  };
};

// Helper to render the Machines
const machinesRow = (machines: string[]): MainTableRow | null => {
  if (!machines.length) {
    return null;
  }
  return {
    columns: [
      {
        content: (
          <>
            <Icon name="machines" className="icon" />
            Machines ({machines.length})
          </>
        ),
      },
      {
        content: <div>{machines.join(", ")}</div>,
        className: "p-table__cell--icon-placeholder",
      },
    ],
  };
};

// Helper to render the Persistent Storage
const storageRow = (
  hasStorage: boolean,
  storageIDs: string[],
): MainTableRow | null => {
  if (!hasStorage) {
    return null;
  }
  return {
    columns: [
      {
        content: (
          <>
            <Icon name="pods" className="icon" />
            Attached storage ({storageIDs.length})
          </>
        ),
      },
      {
        content: <div>{storageIDs.join(", ")}</div>,
        className: "p-table__cell--icon-placeholder",
      },
    ],
  };
};

const AccordionContent = ({
  modelUUID,
}: {
  modelUUID: string;
}): JSX.Element => {
  const {
    hasStorage,
    applications,
    machines,
    crossModelRelations,
    showInfoTable,
    storageIDs,
    destroyBlockedReason,
  } = useModelDestructionData(modelUUID);
  const dispatch = useAppDispatch();
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const selectedModel = useAppSelector((state) =>
    getSelectedModelForDestruction(state, modelUUID),
  );
  const isReviewed = selectedModel?.reviewed;
  const isRemoved = selectedModel?.removed;

  const infoTableRows = useMemo(
    () =>
      filterBoolean([
        applicationsRow(applications),
        crossModelRelationsRow(crossModelRelations),
        machinesRow(machines),
        storageRow(hasStorage, storageIDs),
      ]),
    [applications, crossModelRelations, machines, hasStorage, storageIDs],
  );
  const isDestroyBlocked = destroyBlockedReason !== null;

  const toggleRemoveFromSelection = (): void => {
    if (wsControllerURL) {
      dispatch(
        jujuActions.toggleModelRemovedFromDestruction({
          modelUUID: modelUUID,
          wsControllerURL,
        }),
      );
      // If the model was marked as reviewed, undo it.
      if (isReviewed) {
        dispatch(
          jujuActions.toggleModelReviewedForDestruction({
            modelUUID: modelUUID,
            wsControllerURL,
          }),
        );
      }
    }
  };

  const toggleModelReviewed = (): void => {
    // Only toggle the reviewed state if the model is not already reviewed.
    if (wsControllerURL && !isReviewed) {
      dispatch(
        jujuActions.toggleModelReviewedForDestruction({
          modelUUID: modelUUID,
          wsControllerURL,
        }),
      );
    }
  };

  return (
    <div className="accordion-content u-sv1">
      {showInfoTable ? (
        <MainTable
          headers={[
            { content: "type" },
            { content: "name", className: "p-table__cell--icon-placeholder" },
          ]}
          rows={infoTableRows}
          className="p-main-table u-no-margin--bottom accordion-content__info-table"
        />
      ) : (
        <div className="u-sv1--top">This model is empty.</div>
      )}
      {!isDestroyBlocked ? (
        <span className="accordion-content__actions u-sv2--top">
          <Button
            onClick={toggleRemoveFromSelection}
            appearance="secondary"
            hasIcon
          >
            <Icon name={isRemoved ? "plus" : "minus"} />
            <span>{isRemoved ? Label.ADD_MODEL : Label.REMOVE_MODEL}</span>
          </Button>
          <Button
            appearance="positive"
            type="button"
            onClick={toggleModelReviewed}
            disabled={isRemoved}
            hasIcon
          >
            <Icon name="success-grey" />
            <span>{isReviewed ? Label.REVIEWED : Label.MARK_REVIEWED}</span>
          </Button>
        </span>
      ) : null}
    </div>
  );
};

export default AccordionContent;
