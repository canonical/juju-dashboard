import { ReactElement, useState } from "react";
import useModelStatus from "hooks/useModelStatus";

import "./_offers-panel.scss";

type Props = {
  entity: string;
};

export default function OffersPanel({
  entity: application,
}: Props): ReactElement {
  const modelStatusData = useModelStatus();
  const offers = modelStatusData?.offers[application];

  const [accordionPanelId, setAccordionPanelId] = useState("");

  const handleAccordionToggle = (id: string) => {
    setAccordionPanelId(id === accordionPanelId ? "" : id);
  };

  return (
    <div className="offers-panel">
      <span className="p-muted-heading">mysql:db</span>
      <h5>Offer info</h5>
      <table className="offers-panel__table">
        <tbody>
          <tr className="offers-panel__tr">
            <th className="offers-panel__th">Offer name</th>
            <td className="offers-panel__td">{offers["offer-name"]}</td>
          </tr>
          <tr className="offers-panel__tr">
            <th className="offers-panel__th">Application</th>
            <td className="offers-panel__td">{application}</td>
          </tr>
          <tr className="offers-panel__tr">
            <th className="offers-panel__th">Charm</th>
            <td className="offers-panel__td">
              <a className="p-link--external" href="#_">
                {offers["charm"]}
              </a>
            </td>
          </tr>
          <tr className="offers-panel__tr">
            <th className="offers-panel__th">Store</th>
            <td className="offers-panel__td">mysql:db</td>
          </tr>
          <tr className="offers-panel__tr">
            <th className="offers-panel__th">URL</th>
            <td>mysql:db</td>
          </tr>
        </tbody>
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
              <table className="offers-panel__table">
                <tbody>
                  <tr className="offers-panel__tr">
                    <th className="offers-panel__th">Endpoint</th>
                    <td className="offers-panel__td">-</td>
                  </tr>
                  <tr className="offers-panel__tr">
                    <th className="offers-panel__th">Interface</th>
                    <td className="offers-panel__td">-</td>
                  </tr>
                  <tr className="offers-panel__tr">
                    <th className="offers-panel__th">Role</th>
                    <td className="offers-panel__td">-</td>
                  </tr>
                </tbody>
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
              <table className="offers-panel__table">
                <tbody>
                  <tr className="offers-panel__tr">
                    <th className="offers-panel__th">UUID</th>
                    <td className="offers-panel__td">-</td>
                  </tr>
                  <tr className="offers-panel__tr">
                    <th className="offers-panel__th">User</th>
                    <td className="offers-panel__td">-</td>
                  </tr>
                  <tr className="offers-panel__tr">
                    <th className="offers-panel__th">User</th>
                    <td className="offers-panel__td">-</td>
                  </tr>
                  <tr className="offers-panel__tr">
                    <th className="offers-panel__th">Status</th>
                    <td className="offers-panel__td">-</td>
                  </tr>
                  <tr className="offers-panel__tr">
                    <th className="offers-panel__th">Ingress-subnets</th>
                    <td className="offers-panel__td">-</td>
                  </tr>
                </tbody>
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
              <table className="offers-panel__table">
                <tbody>
                  <tr className="offers-panel__tr">
                    <th className="offers-panel__th">User</th>
                    <td className="offers-panel__td">-</td>
                  </tr>
                  <tr className="offers-panel__tr">
                    <th className="offers-panel__th">Display-name</th>
                    <td className="offers-panel__td">-</td>
                  </tr>
                  <tr className="offers-panel__tr">
                    <th className="offers-panel__th">Access</th>
                    <td className="offers-panel__td">-</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </li>
        </ul>
      </aside>
    </div>
  );
}
