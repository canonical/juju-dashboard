import { Button } from "@canonical/react-components";

type Props = {
  handleQuery: (query: string) => void;
  query: string;
};

const QueryLink = ({ handleQuery, query }: Props): JSX.Element => {
  return (
    <Button
      appearance="link"
      className="u-no-margin u-no-padding u-align--left p-text--small"
      onClick={() => handleQuery(query)}
      type="button"
    >
      <code>{query}</code>
    </Button>
  );
};

export default QueryLink;
