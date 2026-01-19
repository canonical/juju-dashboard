import type { ApplicationStatus } from "@canonical/jujulib/dist/api/facades/client/ClientV7";
import Fuse from "fuse.js";
import type { FC } from "react";
import { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";

import type { EntityDetailsRoute } from "components/Routes";
import { useQueryParams } from "hooks/useQueryParams";
import { actions as jujuActions } from "store/juju";
import {
  getModelApplications,
  getModelUUIDFromList,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";

import LocalAppsTable from "../LocalAppsTable";

const SearchResults: FC = () => {
  const dispatch = useDispatch();
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, userName),
  );
  const applications = useAppSelector((state) =>
    getModelApplications(state, modelUUID),
  );
  const [filteredApplications, setFilteredApplications] = useState<
    Record<string, ApplicationStatus>
  >({});
  const [fuse, setFuse] = useState<Fuse<{ name: string; charm: string }>>(
    new Fuse([]),
  );
  const [{ filterQuery }] = useQueryParams<{
    filterQuery: string;
  }>({
    filterQuery: "",
  });

  useMemo(() => {
    if (applications) {
      setFuse(
        new Fuse(
          Object.entries(applications).map(([name, { charm }]) => ({
            name,
            charm,
          })),
          {
            keys: ["name", "charm"],
          },
        ),
      );
    }
  }, [applications]);

  useEffect(() => {
    if (!applications) {
      return;
    }
    const searchedApps = fuse.search(filterQuery).map(({ item }) => item);
    const filtered: Record<string, ApplicationStatus> = {};
    searchedApps.forEach((application) => {
      if (application.name in applications) {
        filtered[application.name] = applications[application.name];
      }
    });
    setFilteredApplications(filtered);
    // On a new search reset the selected applications.
    dispatch(
      jujuActions.updateSelectedApplications({
        selectedApplications: {},
      }),
    );
  }, [fuse, filterQuery, applications, dispatch]);

  useEffect(
    () => (): void => {
      // Clean up any selected applications that have been stored in Redux.
      dispatch(
        jujuActions.updateSelectedApplications({
          selectedApplications: {},
        }),
      );
    },
    [dispatch],
  );

  return <LocalAppsTable applications={filteredApplications} />;
};

export default SearchResults;
