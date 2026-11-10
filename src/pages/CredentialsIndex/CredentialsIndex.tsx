import {
  Button,
  Notification as ReactNotification,
  SearchAndFilter,
} from "@canonical/react-components";
import type { SearchAndFilterChip } from "@canonical/react-components/dist/components/SearchAndFilter/types";
import fastDeepEqual from "fast-deep-equal/es6";
import type { JSX } from "react";
import { useEffect, useMemo } from "react";
import { shallowEqual } from "react-redux";

import CredentialsTable from "components/CredentialsTable";
import { useQueryParams } from "hooks/useQueryParams";
import useWindowTitle from "hooks/useWindowTitle";
import MainContent from "layout/MainContent";
import { getWSControllerURL, isLoggedIn } from "store/general/selectors";
import {
  getCloudTags,
  getCredentialContentsState,
  getCredentialsWithContents,
  getCredentialTags,
  getUserCredentialsState,
} from "store/juju/selectors";
import { pluralize } from "store/juju/utils/models";
import credentialContentsMiddleware from "store/middleware/source/credential-contents";
import userCredentialsMiddleware from "store/middleware/source/user-credentials";
import { useAppDispatch, useAppSelector } from "store/store";

export default function Credentials(): JSX.Element {
  useWindowTitle("Credentials");
  const dispatch = useAppDispatch();
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const controllerLoggedIn = useAppSelector((state) =>
    wsControllerURL ? isLoggedIn(state, wsControllerURL) : false,
  );
  const userCredentials = useAppSelector(getUserCredentialsState);
  const credentialContents = useAppSelector(getCredentialContentsState);
  const credentialsError =
    userCredentials.errors?.message ?? credentialContents.errors?.message;
  // Compare the tags by value so the sources are only restarted when the tags
  // change, not each time the credentials state is updated (e.g. by a poll).
  const cloudTags = useAppSelector(getCloudTags, shallowEqual);
  const credentialTags = useAppSelector(getCredentialTags, shallowEqual);
  const credentials = useAppSelector(getCredentialsWithContents);

  useEffect(() => {
    if (!wsControllerURL || !controllerLoggedIn || !cloudTags.length) {
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
  }, [dispatch, wsControllerURL, controllerLoggedIn, cloudTags]);

  useEffect(() => {
    if (
      !wsControllerURL ||
      !controllerLoggedIn ||
      credentialTags.length === 0
    ) {
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
  }, [dispatch, wsControllerURL, controllerLoggedIn, credentialTags]);

  const [queryParams, setQueryParams] = useQueryParams<{
    cloud: string[];
    credential: string[];
    custom: string[];
  }>({
    cloud: [],
    credential: [],
    custom: [],
  });
  const filters = {
    cloud: queryParams.cloud,
    credential: queryParams.credential,
    custom: queryParams.custom,
  };

  // Generate the chips from the available credentials.
  const chips = useMemo(() => {
    const generateChips = (
      lead: string,
      values: string[],
    ): SearchAndFilterChip[] =>
      [...new Set(values)].map((value) => ({ lead, value }));
    return {
      cloud: generateChips(
        "Cloud",
        credentials.map(({ cloud }) => cloud),
      ),
      credential: generateChips(
        "Credential",
        credentials.map(({ name }) => name),
      ),
    };
  }, [credentials]);

  const existingSearchData: SearchAndFilterChip[] = Object.entries(
    filters,
  ).flatMap(([lead, values]) =>
    values.filter(Boolean).map((value) => ({ lead, value })),
  );

  const credentialCount = credentialTags.length;

  return (
    <MainContent
      contentClassName="u-no-padding--top"
      title={
        <span className="u-show--large">
          {credentialCount} {pluralize(credentialCount, "credential")}
        </span>
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
      <span className="u-sv3">
        <SearchAndFilter
          filterPanelData={[
            { id: 0, heading: "Cloud", chips: chips.cloud },
            { id: 1, heading: "Credential", chips: chips.credential },
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
      </span>
      <CredentialsTable filters={filters} />
    </MainContent>
  );
}
