import type { TabsProps } from "@canonical/react-components";
import { Tabs } from "@canonical/react-components";
import type { FC } from "react";
import type { LinkProps } from "react-router";
import { useParams, Link } from "react-router";

import type { EntityDetailsRoute } from "components/Routes";
import { useQueryParams } from "hooks/useQueryParams";
import { useAuditLogsPermitted } from "juju/api-hooks/permissions";
import {
  isKubernetesModel,
  getCanListSecrets,
  getModelUUIDFromList,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";
import urls from "urls";
import { ModelTab } from "urls";

import { Label } from "./types";

const ModelTabs: FC = () => {
  const { qualifier = null, modelName = null } =
    useParams<EntityDetailsRoute>();
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, qualifier),
  );
  const isK8s = useAppSelector((state) => isKubernetesModel(state, modelUUID));
  const canListSecrets = useAppSelector((state) =>
    getCanListSecrets(state, modelUUID),
  );
  const { permitted: auditLogsAllowed } = useAuditLogsPermitted();
  const [query] = useQueryParams({
    panel: null,
    entity: null,
    activeView: "apps",
    filterQuery: "",
  });
  const { activeView } = query;

  const handleNavClick = (ev: React.MouseEvent): void => {
    (ev.target as HTMLAnchorElement)?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  };

  const tabs: TabsProps<LinkProps>["links"] = [];
  if (qualifier && modelName) {
    tabs.push(
      {
        active: activeView === ModelTab.APPS,
        label: Label.APPLICATIONS,
        onClick: (ev: React.MouseEvent) => {
          handleNavClick(ev);
        },
        to: urls.model.tab({ qualifier, modelName, tab: ModelTab.APPS }),
        component: Link,
      },
      {
        active: activeView === ModelTab.INTEGRATIONS,
        label: Label.INTEGRATIONS,
        onClick: (ev: React.MouseEvent) => {
          handleNavClick(ev);
        },
        to: urls.model.tab({
          qualifier,
          modelName,
          tab: ModelTab.INTEGRATIONS,
        }),
        component: Link,
      },
      {
        active: activeView === "logs",
        label: auditLogsAllowed ? Label.LOGS : Label.ACTION_LOGS,
        onClick: (ev: React.MouseEvent) => {
          handleNavClick(ev);
        },
        to: urls.model.tab({ qualifier, modelName, tab: ModelTab.LOGS }),
        component: Link,
      },
    );

    if (canListSecrets) {
      tabs.push({
        active: activeView === "secrets",
        label: Label.SECRETS,
        onClick: (ev: React.MouseEvent) => {
          handleNavClick(ev);
        },
        to: urls.model.tab({ qualifier, modelName, tab: ModelTab.SECRETS }),
        component: Link,
      });
    }

    if (!isK8s) {
      tabs.push({
        active: activeView === ModelTab.MACHINES,
        label: Label.MACHINES,
        onClick: (ev: React.MouseEvent) => {
          handleNavClick(ev);
        },
        to: urls.model.tab({ qualifier, modelName, tab: ModelTab.MACHINES }),
        component: Link,
      });
    }
  }

  return <Tabs links={tabs} />;
};

export default ModelTabs;
