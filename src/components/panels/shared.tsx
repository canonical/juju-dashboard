type data = {
  th: string;
  td: string;
};

export const generatePanelTableRows = (data: data[]) => {
  return data.map(({ th, td }) => {
    return (
      <tr className="panel__tr" key={th + td}>
        <th className="panel__th">{th}</th>
        <td className="panel__td">{td}</td>
      </tr>
    );
  });
};
