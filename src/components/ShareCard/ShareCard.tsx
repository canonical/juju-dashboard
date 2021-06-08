import { useState } from "react";
import { Formik, Field, Form } from "formik";
import toast from "react-hot-toast";
import { formatFriendlyDateToNow } from "app/utils/utils";

import ToastCard from "components/ToastCard/ToastCard";

import SlideDownFadeOut from "animations/SlideDownFadeOut";

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
  const [hasBeenRemoved, setHasBeenRemoved] = useState(false);

  return (
    <div>
      <SlideDownFadeOut isAnimating={hasBeenRemoved}>
        <div className="share-card" data-active={inFocus}>
          <div className="share-card__title">
            <strong className="share-card__username">{userName}</strong>
            <span className="share-card__secondary">
              {isOwner ? (
                "Owner"
              ) : (
                <i
                  className="p-icon--delete"
                  onClick={() => {
                    removeUser(userName);
                    setHasBeenRemoved(true);
                    toast.custom((t) => (
                      <ToastCard
                        toastInstance={t}
                        type="positive"
                        text={`<strong>${userName}</strong> has been successfully removed.`}
                      />
                    ));
                  }}
                  onKeyPress={() => removeUser(userName)}
                  role="button"
                  tabIndex={0}
                >
                  Remove user
                </i>
              )}
            </span>
          </div>
          <div className="share-card__supplementary">
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
                    className="share__card-access"
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
      </SlideDownFadeOut>
    </div>
  );
}
