import { useState } from "react";
import { Formik, Field, Form } from "formik";
import { formatFriendlyDateToNow } from "app/utils/utils";

import "./_share-card.scss";

type Props = {
  userName: string;
  lastConnected: string | null;
  access: string;
  isOwner: boolean;
  removeUser: (userName: string) => void;
  accessSelectChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    userName: string
  ) => void;
};

export default function ShareCard({
  userName,
  lastConnected,
  access,
  isOwner,
  removeUser,
  accessSelectChange,
}: Props) {
  const [inFocus, setInFocus] = useState(false);
  return (
    <div className="share__card" key={userName} data-active={inFocus}>
      <div className="share__card-title">
        <strong>{userName}</strong>
        <span className="secondary">
          {isOwner ? (
            "Owner"
          ) : (
            <i
              className="p-icon--delete"
              onClick={() => removeUser(userName)}
              onKeyPress={() => removeUser(userName)}
              role="button"
              tabIndex={0}
            >
              Remove user
            </i>
          )}
        </span>
      </div>
      <div className="supplementary">
        Last connected:{" "}
        {lastConnected
          ? formatFriendlyDateToNow(lastConnected)
          : `Never connected`}
        {!isOwner && (
          <Formik initialValues={{}} onSubmit={() => {}}>
            <Form>
              <Field
                as="select"
                name="access"
                onFocus={() => setInFocus(true)}
                onBlur={() => setInFocus(false)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  accessSelectChange(e, userName);
                  setInFocus(false);
                }}
                value={access}
              >
                <option value="read">Read</option>
                <option value="write">Write</option>
                <option value="admin">Admin</option>
              </Field>
            </Form>
          </Formik>
        )}
      </div>
    </div>
  );
}
