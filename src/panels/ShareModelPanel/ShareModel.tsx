import { useParams } from "react-router-dom";

import Aside from "components/Aside/Aside";
import PanelHeader from "components/PanelHeader/PanelHeader";

import type { EntityDetailsRoute } from "components/Routes/Routes";

import "./share-model.scss";

export default function ShareModel() {
  const { modelName } = useParams<EntityDetailsRoute>();
  return (
    <Aside>
      <div className="p-panel share-model">
        <PanelHeader
          title={
            <div className="title-wrapper">
              <i className="p-icon--share"></i>
              <h4>Share {modelName}</h4>
            </div>
          }
        />
        <div className="p-panel__content">
          <div>
            <h4>Sharing with</h4>
            <div className="share-model__card">
              <div className="share-model__card-title">
                <strong>clara</strong>
                <span className="secondary">owner</span>
              </div>
              <p className="supplementary">Last connection: 20 minutes ago</p>
            </div>
          </div>
          <div>
            <h4>Add new user</h4>
            <form>
              <label className="is-required" htmlFor="username">
                Username
              </label>
              <input required type="text" placeholder="Username" />
              <label className="is-required" htmlFor="accessLevel">
                Access level
              </label>
              <div className="p-radio">
                <input
                  type="radio"
                  className="p-radio__input"
                  name="accessLevel"
                  aria-labelledby="accessLevel1"
                />
                <span className="p-radio__label" id="accessLevel1">
                  read
                  <span className="help-text">
                    A user can view the state of the model
                  </span>
                </span>
              </div>

              <div className="p-radio">
                <input
                  type="radio"
                  className="p-radio__input"
                  name="accessLevel"
                  aria-labelledby="accessLevel2"
                />
                <span className="p-radio__label" id="accessLevel2">
                  write
                  <span className="help-text">
                    In addition to 'read' abilities, a user can modify/configure
                    models
                  </span>
                </span>
              </div>

              <div className="p-radio">
                <input
                  type="radio"
                  className="p-radio__input"
                  name="accessLevel"
                  aria-labelledby="accessLevel3"
                />
                <span className="p-radio__label" id="accessLevel3">
                  admin
                  <span className="help-text">
                    In addition to 'write' abilities, a user can perform model
                    upgrades and connect to machines via juju ssh. Makes the
                    user an effective model owner.
                  </span>
                </span>
              </div>
              <div className="action-wrapper">
                <button className="p-button--positive">Add user</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Aside>
  );
}
