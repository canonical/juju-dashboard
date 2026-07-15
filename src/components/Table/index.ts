import BodyComponent from "./Body";
import Cell from "./Cell";
import HeaderComponent from "./Header";
import HeaderCell from "./HeaderCell";
import Row from "./Row";
import TableComponent from "./Table";

const Header = HeaderComponent as {
  Cell: typeof HeaderCell;
} & typeof HeaderComponent;
Header.Cell = HeaderCell;

/**
 * An HTML table.
 */
const Table = TableComponent as {
  Body: typeof BodyComponent;
  Cell: typeof Cell;
  Header: typeof Header;
  Row: typeof Row;
} & typeof TableComponent;
Table.Body = BodyComponent;
Table.Cell = Cell;
Table.Header = Header;
Table.Row = Row;

export default Table;
