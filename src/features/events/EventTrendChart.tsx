import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EventTrendPoint } from "@/types/analysis";

type EventTrendChartProps = {
  data: EventTrendPoint[];
  hasBaseline: boolean;
};

const numberFormatter = new Intl.NumberFormat("en-US");

export function EventTrendChart({ data, hasBaseline }: EventTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -14 }}>
        <CartesianGrid stroke="#eee8e2" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="timestamp"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#766b63", fontSize: 11 }}
          tickMargin={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#766b63", fontSize: 11 }}
          tickFormatter={(value: number) => numberFormatter.format(value)}
        />
        <Tooltip
          formatter={(value, name) => [
            numberFormatter.format(Number(value)),
            name === "current" ? "Observed" : "Reference",
          ]}
          contentStyle={{ border: "1px solid #e8e3df", borderRadius: 6, fontSize: 12 }}
        />
        <Line
          type="monotone"
          dataKey="current"
          name="current"
          stroke="#b5460b"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "#b5460b", strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
        {hasBaseline && (
          <Line
            type="monotone"
            dataKey="baseline"
            name="baseline"
            stroke="#95877c"
            strokeWidth={1.75}
            strokeDasharray="5 5"
            dot={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}