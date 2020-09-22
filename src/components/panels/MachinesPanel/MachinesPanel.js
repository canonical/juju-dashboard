import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { getConfig } from "app/selectors";
import SlidePanel from "components/SlidePanel/SlidePanel";
import MainTable from "@canonical/react-components/dist/components/MainTable";

import useModelStatus from "hooks/useModelStatus";

import {
  generateEntityIdentifier,
  unitTableHeaders,
  machineTableHeaders,
  relationTableHeaders,
  generateMachineRows,
  generateRelationRows,
  generateUnitRows,
} from "pages/Models/Details/generators";

import {
  extractRevisionNumber,
  generateStatusElement,
  filterModelStatusDataByMachine,
} from "app/utils";

import "./_machines-panel.scss";

export default function MachinesPanel({ isActive, onClose, entity }) {
  const modelStatusData = useModelStatus();

  const { baseAppURL } = useSelector(getConfig);

  // Filter model status via selected entity
  const filteredModelStatusData = filterModelStatusDataByMachine(
    modelStatusData,
    entity
  );

  // Generate panel header for given entity
  // const generateMachinesPanelHeader = (machine, baseAppURL, entity) => {
  //   return (
  //     <div className="slidepanel-apps-header">
  //       {machine && (
  //         <div className="row">
  //           <div className="col-3">
  //             <div>
  //               {generateEntityIdentifier(
  //                 machine.charm,
  //                 entity,
  //                 false,
  //                 baseAppURL,
  //                 true // disable link
  //               )}
  //             </div>
  //             <span className="u-capitalise">
  //               {machine.status?.status
  //                 ? generateStatusElement(machine.status.status)
  //                 : "-"}
  //             </span>
  //           </div>
  //           <div className="col-3">
  //             <div className="slidepanel-apps__kv">
  //               <span className="slidepanel-apps__label">Charm: </span>
  //               <span title={machine.charm} className="slidepanel-apps__value">
  //                 {machine.charm}
  //               </span>
  //             </div>

  //             <div className="slidepanel-apps__kv">
  //               <span className="slidepanel-apps__label">OS:</span>
  //               <span className="slidepanel-apps__value">Ubuntu</span>
  //             </div>

  //             <div className="slidepanel-apps__kv">
  //               <span className="slidepanel-apps__label">Revision:</span>
  //               <span className="slidepanel-apps__value">
  //                 {extractRevisionNumber(machine.charm) || "-"}
  //               </span>
  //             </div>

  //             <div className="slidepanel-apps__kv">
  //               <span className="slidepanel-apps__label">Version:</span>
  //               <span className="slidepanel-apps__value">
  //                 {machine.workloadVersion || "-"}
  //               </span>
  //             </div>
  //           </div>
  //           <div className="col-6">
  //             {/* Notes - not currently implemented/available */}
  //           </div>
  //         </div>
  //       )}
  //     </div>
  //   );
  // };

  // const appPanelHeader = useMemo(
  //   () =>
  //     generateMachinesPanelHeader(
  //       modelStatusData?.applications[entity],
  //       baseAppURL,
  //       entity
  //     ),
  //   [modelStatusData, entity, baseAppURL]
  // );

  const unitSlidePanelRows = useMemo(
    () => generateUnitRows(filteredModelStatusData, baseAppURL),
    [baseAppURL, filteredModelStatusData]
  );

  // Check for loading status
  const isLoading = !modelStatusData?.machines;

  console.log(modelStatusData);

  return (
    <SlidePanel isActive={isActive} onClose={onClose} isLoading={isLoading}>
      <div className="apps-panel">
        {/* {appPanelHeader} */}
        <div className="slide-panel__tables">
          <MainTable
            headers={unitTableHeaders}
            rows={unitSlidePanelRows}
            className="model-details__units p-main-table"
            sortable
            emptyStateMsg={"There are no units in this model"}
          />
        </div>
      </div>
    </SlidePanel>
  );
}
