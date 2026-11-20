import {
  Button,
  Icon,
  Notification as ReactNotification,
  SearchAndFilter,
  Tooltip,
} from "@canonical/react-components";
import type { SearchAndFilterChip } from "@canonical/react-components/dist/components/SearchAndFilter/types";
import fastDeepEqual from "fast-deep-equal/es6";
import type { JSX, ReactNode } from "react";
import { useEffect } from "react";
import { shallowEqual } from "react-redux";

import CredentialsTable from "components/CredentialsTable";
import LoadingSpinner from "components/LoadingSpinner";
import { useQueryParams } from "hooks/useQueryParams";
import useWindowTitle from "hooks/useWindowTitle";
import MainContent from "layout/MainContent";
import { getWSControllerURL } from "store/general/selectors";
import {
  getCloudTags,
  getCredentialsError,
  getCredentialsLoaded,
  getCredentialsWithContents,
  getCredentialTags,
} from "store/juju/selectors";
import { pluralize } from "store/juju/utils/models";
import credentialContentsMiddleware from "store/middleware/source/credential-contents";
import userCredentialsMiddleware from "store/middleware/source/user-credentials";
import { useAppDispatch, useAppSelector } from "store/store";
import { externalURLs } from "urls";

import { Label } from "./types";
import { generateChips } from "./utils";

export default function Credentials(): JSX.Element {
  useWindowTitle("Credentials");
  const dispatch = useAppDispatch();
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const credentialsError = useAppSelector(getCredentialsError);
  // Compare the tags by value so the sources are only restarted when the tags
  // change, not each time the credentials state is updated (e.g. by a poll).
  const cloudTags = useAppSelector(getCloudTags, shallowEqual);
  const hasClouds = cloudTags.length > 0;
  const credentialTags = useAppSelector(getCredentialTags, shallowEqual);
  const credentials = useAppSelector(getCredentialsWithContents);
  const credentialsLoaded = useAppSelector(getCredentialsLoaded);

  useEffect(() => {
    if (!wsControllerURL || !cloudTags.length) {
      return;
    }

    dispatch(
      userCredentialsMiddleware.actions.start({ wsControllerURL, cloudTags }),
    );
    return (): void => {
      dispatch(
        userCredentialsMiddleware.actions.stop({ wsControllerURL, cloudTags }),
      );
    };
  }, [dispatch, wsControllerURL, cloudTags]);

  useEffect(() => {
    if (!wsControllerURL || credentialTags.length === 0) {
      return;
    }

    dispatch(
      credentialContentsMiddleware.actions.start({
        wsControllerURL,
        credentialTags,
      }),
    );
    return (): void => {
      dispatch(
        credentialContentsMiddleware.actions.stop({
          wsControllerURL,
          credentialTags,
        }),
      );
    };
  }, [dispatch, wsControllerURL, credentialTags]);

  const [queryParams, setQueryParams] = useQueryParams<{
    cloud: string[];
    credential: string[];
    custom: string[];
  }>({
    cloud: [],
    credential: [],
    custom: [],
  });
  const [, setPanelQuery] = useQueryParams<{ panel: null | string }>({
    panel: null,
  });
  const filters = {
    cloud: queryParams.cloud,
    credential: queryParams.credential,
    custom: queryParams.custom,
  };

  const existingSearchData: SearchAndFilterChip[] = Object.entries(
    filters,
  ).flatMap(([lead, values]) =>
    values.filter(Boolean).map((value) => ({ lead, value })),
  );

  const credentialCount = credentialTags.length;

  // Wait for the credentials, otherwise the message for there being no
  // credentials would be shown before they have loaded. Don't wait if there is
  // an error, as they might never load.
  if (!credentialsLoaded && !credentialsError) {
    return <LoadingSpinner />;
  }

  const addCredentialButton: ReactNode = (
    <Button
      appearance="positive"
      className="u-no-margin--bottom"
      hasIcon
      disabled={!hasClouds}
      onClick={() => {
        setPanelQuery({ panel: "add-credential" }, { replace: true });
      }}
    >
      <Icon name="plus" light />
      <span>{Label.ADD_CREDENTIAL}</span>
    </Button>
  );

  return (
    <MainContent
      contentClassName="u-no-padding--top credentials__content-wrapper"
      title={
        <div className="credentials__header">
          <span className="u-show--large">
            {credentialCount} {pluralize(credentialCount, "credential")}
          </span>
          {!hasClouds ? (
            <Tooltip message={Label.NO_CLOUDS} position="btm-right">
              {addCredentialButton}
            </Tooltip>
          ) : (
            addCredentialButton
          )}
        </div>
      }
      titleComponent="div"
      titleClassName="u-no-max-width u-full-width"
    >
      {credentialsError ? (
        <ReactNotification severity="negative" title="Error">
          {credentialsError} Try{" "}
          <Button
            appearance="link"
            onClick={() => {
              window.location.reload();
            }}
          >
            refreshing
          </Button>{" "}
          the page.
        </ReactNotification>
      ) : null}
      {credentialsLoaded ? (
        <div className="credentials__content">
          {credentialCount === 0 ? (
            <div>
              <h3>{Label.NOT_FOUND}</h3>
              <p>
                Learn about{" "}
                <a href={externalURLs.cliHelpCommand("add-credential")}>
                  adding credentials
                </a>
                .
              </p>
            </div>
          ) : (
            <>
              <SearchAndFilter
                filterPanelData={[
                  {
                    id: 0,
                    heading: "Cloud",
                    chips: generateChips(
                      "Cloud",
                      credentials.map(({ cloud }) => cloud),
                    ),
                  },
                  {
                    id: 1,
                    heading: "Credential",
                    chips: generateChips(
                      "Credential",
                      credentials.map(({ name }) => name),
                    ),
                  },
                ]}
                existingSearchData={existingSearchData}
                returnSearchData={(searchData) => {
                  const activeFilters: typeof filters = {
                    cloud: [],
                    credential: [],
                    custom: [],
                  };
                  searchData.forEach(({ lead, value }) => {
                    const key = lead?.toLowerCase();
                    if (key === "cloud" || key === "credential") {
                      activeFilters[key].push(value);
                    } else {
                      activeFilters.custom.push(value);
                    }
                  });
                  if (!fastDeepEqual(activeFilters, filters)) {
                    setQueryParams(activeFilters);
                  }
                }}
              />
              <div className="u-sv3--top">
                <CredentialsTable filters={filters} />
              </div>
            </>
          )}
        </div>
      ) : null}
    </MainContent>
  );
}
