import { Formik, Field, Form } from "formik";
import { formatFriendlyDateToNow } from "app/utils/utils";

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
  return (
    <div className="share-model__card" key={userName}>
      <div className="share-model__card-title">
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  accessSelectChange(e, userName)
                }
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
