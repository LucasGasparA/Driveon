import { Paper, TableContainer, type TableContainerProps } from "@mui/material";

export default function ListTableContainer({ sx, ...props }: TableContainerProps) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        height: { xs: 360, md: 400 },
        overflowY: "auto",
        ...sx,
      }}
      {...props}
    />
  );
}
