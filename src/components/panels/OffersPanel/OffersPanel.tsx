import { ReactElement, useState } from "react";
import useModelStatus from "hooks/useModelStatus";
import type { TSFixMe } from "types";

import { generatePanelTableRows } from "../shared";

import "../_panels.scss";

type Props = {
  entity: string;
};

type tableData = {
  th: string;
  td: string;
};

export default function OffersPanel({
  entity: application,
}: Props): ReactElement {
  const modelStatusData: TSFixMe = useModelStatus();
  const offers = modelStatusData?.offers[application];

  const [accordionPanelId, setAccordionPanelId] = useState("");

  const handleAccordionToggle = (id: string) => {
    setAccordionPanelId(id === accordionPanelId ? "" : id);
  };

  const offerInfo: tableData[] = [
    { th: "Offer name", td: offers["offer-name"] },
    { th: "Application", td: application },
    { th: "Charm", td: "-" },
    { th: "Store", td: "-" },
    { th: "URL", td: "-" },
  ];

  const tab1: tableData[] = [
    { th: "Endpoint", td: "-" },
    { th: "Interface", td: "-" },
    { th: "Role", td: "-" },
  ];

  const tab2: tableData[] = [
    { th: "UUID", td: "-" },
    { th: "User", td: "-" },
    { th: "Relation-id", td: "-" },
    { th: "Status", td: "-" },
    { th: "Ingress-subnets", td: "-" },
  ];

  const tab3: tableData[] = [
    { th: "User", td: "-" },
    { th: "display-name", td: "-" },
    { th: "access", td: "-" },
  ];

  return (
    <div className="panel">
      <span className="p-muted-heading">mysql:db</span>
      <h5>Offer info</h5>
      <table className="panel__table">
        <tbody>{generatePanelTableRows(offerInfo)}</tbody>
      </table>

      <aside className="p-accordion">
        <ul className="p-accordion__list">
          <li className="p-accordion__group">
            <button
              type="button"
              className="p-accordion__tab"
              id="tab1"
              aria-controls="tab1-section"
              aria-expanded={accordionPanelId === "tab1"}
              onClick={() => handleAccordionToggle("tab1")}
            >
              Endpoint 1
            </button>
            <section
              className="p-accordion__panel"
              id="tab1-section"
              aria-hidden={accordionPanelId !== "tab1"}
              aria-labelledby="tab1"
            >
              <table className="panel__table">
                <tbody>{generatePanelTableRows(tab1)}</tbody>
              </table>
            </section>
          </li>
          <li className="p-accordion__group">
            <button
              type="button"
              className="p-accordion__tab"
              id="tab2"
              aria-controls="tab2-section"
              aria-expanded={accordionPanelId === "tab2"}
              onClick={() => handleAccordionToggle("tab2")}
            >
              Connection 0/0
            </button>
            <section
              className="p-accordion__panel"
              id="tab2-section"
              aria-hidden={accordionPanelId !== "tab2"}
              aria-labelledby="tab2"
            >
              <table className="panel__table">
                <tbody>{generatePanelTableRows(tab2)}</tbody>
              </table>
            </section>
          </li>
          <li className="p-accordion__group">
            <button
              type="button"
              className="p-accordion__tab"
              id="tab3"
              aria-controls="tab3-section"
              aria-expanded={accordionPanelId === "tab3"}
              onClick={() => handleAccordionToggle("tab3")}
            >
              Users
            </button>
            <section
              className="p-accordion__panel"
              id="tab3-section"
              aria-hidden={accordionPanelId !== "tab3"}
              aria-labelledby="tab3"
            >
              <table className="panel__table">
                <tbody>{generatePanelTableRows(tab3)}</tbody>
              </table>
            </section>
          </li>
        </ul>
      </aside>
    </div>
  );
}
