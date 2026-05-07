import {
  Box,
  Button,
  Chip,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type React from "react";
import { alpha } from "@mui/material/styles";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

type Metric = {
  label: string;
  value: string | number;
  tone?: "primary" | "success" | "warning" | "error" | "neutral";
};

type Props = {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  metrics?: Metric[];
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  actionLabel?: string;
  onAction?: () => void;
};

const toneColor = {
  primary: "#2563EB",
  success: "#16A34A",
  warning: "#D97706",
  error: "#DC2626",
  neutral: "#64748B",
};

export default function ModuleHeader({
  title,
  subtitle,
  icon,
  metrics = [],
  searchValue,
  searchPlaceholder = "Pesquisar",
  onSearchChange,
  actionLabel,
  onAction,
}: Props) {
  return (
    <Box
      sx={{
        mb: 2.25,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", md: "flex-start" }}
        justifyContent="space-between"
      >
        <Stack spacing={1} minWidth={0}>
          <Stack direction="row" spacing={1.25} alignItems="center" minWidth={0}>
            {icon && <Box sx={{ color: "primary.main", display: "flex", "& svg": { fontSize: 24 } }}>{icon}</Box>}
            <Box minWidth={0}>
              <Typography variant="h5" sx={{ fontSize: { xs: 22, md: 24 }, lineHeight: 1.15, fontWeight: 850 }}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
                {subtitle}
              </Typography>
            </Box>
          </Stack>

          {metrics.length > 0 && (
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {metrics.map((metric) => {
                const color = toneColor[metric.tone ?? "neutral"];
                return (
                  <Chip
                    key={metric.label}
                    label={`${metric.label}: ${metric.value}`}
                    size="small"
                    sx={{
                      height: 28,
                      borderRadius: 999,
                      fontWeight: 750,
                      color,
                      bgcolor: alpha(color, 0.08),
                      border: `1px solid ${alpha(color, 0.14)}`,
                    }}
                  />
                );
              })}
            </Stack>
          )}
        </Stack>

        {(onSearchChange || onAction) && (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="stretch">
            {onSearchChange && (
              <TextField
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                sx={{
                  minWidth: { xs: "100%", sm: 300 },
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#FFFFFF",
                    borderRadius: 999,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            {onAction && (
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={onAction} sx={{ borderRadius: 999, px: 2.5 }}>
                {actionLabel}
              </Button>
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
