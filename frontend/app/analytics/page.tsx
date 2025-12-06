"use client";

import { gql, useQuery } from "@apollo/client";
import { client } from "../../lib/apollo-client";
import { useTheme } from "../layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

type Task = {
  id: string;
  is_completed: boolean;
  tag?: string | null;
};

const GET_TASKS = gql`
  query {
    tasks {
      id
      is_completed
      tag
    }
  }
`;

export default function ChartsPage() {
  const { theme } = useTheme();

  const { data, loading } = useQuery<{ tasks: Task[] }>(GET_TASKS, {
    client,
    fetchPolicy: "network-only",
  });

  const tasks: Task[] = data?.tasks ?? [];

  const total = tasks.length;
  const completed = tasks.filter((t) => t.is_completed).length;
  const pending = total - completed;

  const tagMap: Record<string, number> = {};

  tasks.forEach((t) => {
    const key = t.tag ?? "untagged";
    tagMap[key] = (tagMap[key] || 0) + 1;
  });

  const tagData = Object.entries(tagMap).map(([tag, count]) => ({
    tag,
    count,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-10"
    >
      <h2
        className={
          theme === "light"
            ? "text-4xl font-bold mb-10 text-black"
            : "text-4xl font-bold mb-10 text-white"
        }
      >
        Analytics
      </h2>

      {loading && <p className="text-gray-500">Loading charts…</p>}

      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KpiCard label="Total Tasks" value={total} />
            <KpiCard label="Completed" value={completed} />
            <KpiCard label="Pending" value={pending} />
          </div>

          <div
            className={
              theme === "light"
                ? "mt-8 bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
                : "mt-8 bg-slate-900 rounded-2xl shadow-xl p-6 border border-slate-700"
            }
          >
            <h3 className="text-xl font-semibold mb-4">Tasks per Tag</h3>

            {tagData.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No tags yet. Add tags to your tasks to see this chart.
              </p>
            ) : (
              <div className="w-full h-72">
                <ResponsiveContainer>
                  <BarChart data={tagData}>
                    <XAxis dataKey="tag" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-5 border border-gray-100 dark:border-slate-700">
      <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
