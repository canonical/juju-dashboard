/* eslint-disable react/no-array-index-key */
import React from "react";

const tableSet = {
  blocked: [
    {
      model: "1cdk_default",
      owner: "IS-team",
      configuration: 21,
      cloud: "AWS",
      region: "eu-west-1",
      credential: "clean-algebra-1",
      controller: "prodstack-is",
      last_updated: "2019.01.01"
    },
    {
      model: "1my_openstack",
      owner: "IS-team",
      configuration: 19,
      cloud: "Google",
      region: "eu-west-1",
      credential: "clean-algebra-1",
      controller: "prodstack-is",
      last_updated: "2019.01.01"
    },
    {
      model: "1kubernetes_core",
      owner: "Saad",
      configuration: 16,
      cloud: "AWS",
      region: "eu-west-1",
      credential: "clean-algebra-1",
      controller: "prodstack-is",
      last_updated: "2019.01.01"
    },
    {
      model: "1hapood",
      owner: "Asad",
      configuration: 25,
      cloud: "Google",
      region: "eu-west-1",
      credential: "clean-algebra-1",
      controller: "prodstack-is",
      last_updated: "2019.01.01"
    }
  ],
  deploying: [
    {
      model: "2hapood",
      owner: "Wasif",
      configuration: 21,
      cloud: "AWS",
      region: "eu-west-1",
      credential: "clean-algebra-1",
      controller: "prodstack-is",
      last_updated: "2019.01.01"
    },
    {
      model: "3hapood",
      owner: "Ali",
      configuration: 19,
      cloud: "Google",
      region: "eu-west-1",
      credential: "clean-algebra-1",
      controller: "prodstack-is",
      last_updated: "2019.01.01"
    },
    {
      model: "4hapood",
      owner: "Saad",
      configuration: 16,
      cloud: "AWS",
      region: "eu-west-1",
      credential: "clean-algebra-1",
      controller: "prodstack-is",
      last_updated: "2019.01.01"
    },
    {
      model: "5hapood",
      owner: "Asad",
      configuration: 25,
      cloud: "Google",
      region: "eu-west-1",
      credential: "clean-algebra-1",
      controller: "prodstack-is",
      last_updated: "2019.01.01"
    }
  ]
};

const returnTableHeader = table => {
  const header = Object.keys(table[0]);
  return header.map((key, i) => {
    return <th key={i}>{key.toUpperCase()}</th>;
  });
};

const returnTableBodyData = row => {
  const td = Object.values(row);
  return td.map((value, i) => {
    return <td key={i}>{value}</td>;
  });
};

const returnTableBodyRows = table => {
  return table.map((row, i) => {
    return <tr key={i}>{returnTableBodyData(row)}</tr>;
  });
};

const renderTables = tablesObj => {
  const tables = Object.keys(tablesObj);
  return tables.map((key, i) => (
    <table key={i}>
      <thead>
        <tr>{returnTableHeader(tablesObj[key])}</tr>
      </thead>
      <tbody>{returnTableBodyRows(tablesObj[key])}</tbody>
    </table>
  ));
};

export default function TableSet() {
  return renderTables(tableSet);
}
