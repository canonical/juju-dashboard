import { List, Tooltip } from "@canonical/react-components";
import type { ListItem } from "@canonical/react-components/dist/components/List/List";
import { Link } from "react-router-dom";

import ModelDetailsLink from "components/ModelDetailsLink";
import type { ModelData } from "store/juju/types";
import { getModelStatusGroupData } from "store/juju/utils/models";
import urls from "urls";
import { getUserName } from "utils";

type Props = {
  /**
   * The full model data.
   */
  model: ModelData;
};

/**
  Warning message for the model name cell.
  @return The react component for the warning message.
*/
const WarningMessage = ({ model }: Props) => {
  const { messages } = getModelStatusGroupData(model);
  if (!messages.length) {
    return null;
  }
  const ownerTag = model?.info?.["owner-tag"] ?? "";
  const userName = getUserName(ownerTag);
  const modelName = model.model.name;
  const link = (
    <ModelDetailsLink modelName={modelName} ownerTag={ownerTag}>
      {messages[0].message}
    </ModelDetailsLink>
  );
  const list: ListItem[] = messages.slice(0, 5).map((message) => {
    const unitId = message.unitId ? message.unitId.replace("/", "-") : null;
    const appName = message.appName;
    return {
      className: "u-truncate",
      content: (
        <>
          {unitId || appName}:{" "}
          <Link
            to={
              unitId
                ? urls.model.unit({ userName, modelName, appName, unitId })
                : urls.model.app.index({ userName, modelName, appName })
            }
          >
            {message.message}
          </Link>
        </>
      ),
    };
  });
  const remainder = messages.slice(5);
  if (remainder.length) {
    list.push(`+${remainder.length} more...`);
  }
  return (
    <Tooltip
      positionElementClassName="p-tooltip__position-element--inline"
      tooltipClassName="p-tooltip--constrain-width"
      message={<List className="u-no-margin--bottom" items={list} />}
    >
      <span className="model-table-list_error-message">{link}</span>
    </Tooltip>
  );
};

export default WarningMessage;
