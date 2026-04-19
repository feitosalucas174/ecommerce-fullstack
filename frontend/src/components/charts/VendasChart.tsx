"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SalesData } from "@/types";
import { useTheme } from "@/contexts/ThemeContext";

interface VendasChartProps {
  data: SalesData[];
}

export function VendasChart({ data }: VendasChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const formatted = data.map((d) => ({
    ...d,
    period: new Date(d.period + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }),
    total: Number(d.total.toFixed(2)),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={formatted} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#f0f0f0"} />
        <XAxis dataKey="period" tick={{ fontSize: 11, fill: isDark ? "#9ca3af" : "#6b7280" }} />
        <YAxis
          tick={{ fontSize: 11, fill: isDark ? "#9ca3af" : "#6b7280" }}
          tickFormatter={(v) => `R$${v}`}
        />
        <Tooltip
          contentStyle={{ backgroundColor: isDark ? "#1f2937" : "#fff", border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`, borderRadius: "8px", color: isDark ? "#f3f4f6" : "#111827" }}
          formatter={(value: number) => [
            `R$ ${value.toFixed(2).replace(".", ",")}`,
            "Vendas",
          ]}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#salesGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
