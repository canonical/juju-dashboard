import { Button } from "@canonical/react-components";
import Aside from "components/Aside/Aside";
import PanelHeader from "components/PanelHeader/PanelHeader";
import { Field, Form, Formik } from "formik";
import { getCharms } from "juju/model-selectors";
import { useSelector } from "react-redux";
import "./_charms-panel.scss";

type FormType = { selectedCharm: string | null };

export default function CharmsPanel() {
  const charms = useSelector(getCharms());
  const handleSubmit = (values: FormType) => {
    console.log(values);
  };
  return (
    <Aside width="narrow">
      <div className="p-panel charms-panel">
        <PanelHeader title="Choose applications of charm:" />
        <div className="p-panel__content">
          <Formik
            initialValues={{ selectedCharm: null }}
            onSubmit={handleSubmit}
          >
            <Form className="p-form u-fixed-width charm-list">
              <div className="charm-list__items">
                {charms.map((charm) => (
                  <div key={charm.url} className="p-form__group">
                    <label htmlFor={charm.url} className="p-radio">
                      <Field
                        type="radio"
                        id={charm.url}
                        name="selectedCharm"
                        value={charm.url}
                        className="p-radio__input"
                      />
                      <span className="p-radio__label">
                        {`${charm.meta?.name} (rev: ${charm.revision})`}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              <div className="actions-panel__drawer u-float">
                <Button type="submit" className="u-float-right">
                  Next
                </Button>
              </div>
            </Form>
          </Formik>
        </div>
      </div>
    </Aside>
  );
}
