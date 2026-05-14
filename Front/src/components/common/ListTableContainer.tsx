import { Paper, TableContainer, type TableContainerProps } from "@mui/material";

const TABLE_HEADER_HEIGHT = 56;
const TABLE_ROW_HEIGHT = 56;
const VISIBLE_ROWS = 10;
const TABLE_CONTAINER_HEIGHT = TABLE_HEADER_HEIGHT + TABLE_ROW_HEIGHT * VISIBLE_ROWS;

export default function ListTableContainer({ sx, ...props }: TableContainerProps) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        height: TABLE_CONTAINER_HEIGHT,
        overflowY: "auto",
        ...sx,
      }}
      {...props}
    />
  );
}
