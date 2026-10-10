import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import type { Attempt } from "../types";
import { dateKey, percent } from "../utils/study";
export function dailyPoints(attempts: Attempt[], days = 7) {
  return Array.from({ length: days }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (days - 1 - i));
    const a = attempts.filter((a) => dateKey(a.answeredAt) === dateKey(+day));
    return {
      day: `${day.getMonth() + 1}/${day.getDate()}`,
      answers: a.length,
      rate: percent(a.filter((a) => a.isCorrect).length, a.length),
    };
  });
}
export function WeeklyChart({ attempts }: { attempts: Attempt[] }) {
  return (
    <div className="chart" role="img" aria-label="直近7日の日別回答数">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dailyPoints(attempts)}
          margin={{ top: 16, right: 8, left: -22, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border)"
          />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: "var(--muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
            }}
          />
          <Bar
            dataKey="answers"
            name="回答数"
            fill="#0078d4"
            radius={[5, 5, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
export function RateChart({
  data,
  x = "day",
  y = "rate",
  label = "正答率",
}: {
  data: Record<string, string | number>[];
  x?: string;
  y?: string;
  label?: string;
}) {
  return (
    <div className="chart" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: -15, right: 20, top: 15 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey={x} tick={{ fontSize: 11, fill: "var(--muted)" }} />
          <YAxis
            domain={label === "回答数" ? [0, "auto"] : [0, 100]}
            tick={{ fontSize: 11, fill: "var(--muted)" }}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey={y}
            name={label}
            stroke="#0078d4"
            strokeWidth={3}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
