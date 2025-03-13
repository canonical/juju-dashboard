import Fuse from "fuse.js";
import { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";

import type { EntityDetailsRoute } from "components/Routes";
import { useQueryParams } from "hooks/useQueryParams";
import type { ApplicationData, ApplicationInfo } from "juju/types";
import { actions as jujuActions } from "store/juju";
import {
  getModelApplications,
  getModelUUIDFromList,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";

import LocalAppsTable from "../LocalAppsTable";

const SearchResults = () => {
  const dispatch = useDispatch();
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, userName),
  );
  const applications = useAppSelector((state) =>
    getModelApplications(state, modelUUID),
  );
  const [filteredApplications, setFilteredApplications] =
    useState<ApplicationData>({});
  const [fuse, setFuse] = useState<Fuse<ApplicationInfo>>(new Fuse([]));
  const [{ filterQuery }] = useQueryParams<{
    filterQuery: string;
  }>({
    filterQuery: "",
  });

  useMemo(() => {
    if (applications)
      setFuse(
        new Fuse(Object.values(applications), {
          keys: ["name", "charm-url", "owner-tag", "constraints.arch"],
        }),
      );
  }, [applications]);

  useEffect(() => {
    if (!applications) {
      return;
    }
    const searchedApps = fuse.search(filterQuery).map((e) => e.item);
    const filteredApplications: ApplicationData = {};
    searchedApps.forEach((application) => {
      if ("name" in application && applications[application.name]) {
        filteredApplications[application.name] = application;
      }
    });
    setFilteredApplications(filteredApplications);
    // On a new search reset the selected applications.
    dispatch(
      jujuActions.updateSelectedApplications({
        selectedApplications: [],
      }),
    );
  }, [fuse, filterQuery, applications, dispatch]);

  useEffect(
    () => () => {
      // Clean up any selected applications that have been stored in Redux.
      dispatch(
        jujuActions.updateSelectedApplications({
          selectedApplications: [],
        }),
      );
    },
    [dispatch],
  );

  return <LocalAppsTable applications={filteredApplications} />;
};

export default SearchResults;
