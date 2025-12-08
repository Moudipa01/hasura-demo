"use client";

import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { client } from "../lib/apollo-client";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./layout";

type Task = {
  id: number;
  title: string;
  is_completed: boolean;
  tag?: string | null;
  due_date?: string | null;
};

const GET_TASKS = gql`
  query {
    tasks(order_by: { created_at: desc }) {
      id
      title
      is_completed
      tag
      due_date
      created_at  
    }
  }
`;


const INSERT_TASK = gql`
  mutation ($title: String!, $tag: String, $due_date: date) {
    insert_tasks_one(
      object: { title: $title, tag: $tag, due_date: $due_date }
    ) {
      id
      title
    }
  }
`;

const DELETE_TASK = gql`
  mutation ($id: Int!) {
    delete_tasks_by_pk(id: $id) {
      id
    }
  }
`;

const UPDATE_TASK_STATUS = gql`
  mutation ($id: Int!, $is_completed: Boolean!) {
    update_tasks_by_pk(
      pk_columns: { id: $id }
      _set: { is_completed: $is_completed }
    ) {
      id
      is_completed
    }
  }
`;

const UPDATE_TASK_TITLE = gql`
  mutation ($id: Int!, $title: String!) {
    update_tasks_by_pk(
      pk_columns: { id: $id }
      _set: { title: $title }
    ) {
      id
      title
    }
  }
`;

export default function DashboardPage() {
  const { theme } = useTheme();
  const { data, loading, refetch } = useQuery<{ tasks: Task[] }>(GET_TASKS, { client });

  const [addTask] = useMutation(INSERT_TASK, { client });
  const [deleteTask] = useMutation(DELETE_TASK, { client });
  const [updateTaskStatus] = useMutation(UPDATE_TASK_STATUS, { client });
  const [updateTaskTitle] = useMutation(UPDATE_TASK_TITLE, { client });

  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [dueDate, setDueDate] = useState("");

  async function createTask() {
    if (!title.trim()) return;
    await addTask({
      variables: {
        title,
        tag: tag || null,
        due_date: dueDate || null,
      },
    });
    setTitle("");
    setTag("");
    setDueDate("");
    refetch();
  }

  async function toggleComplete(task: Task) {
    await updateTaskStatus({
      variables: { id: task.id, is_completed: !task.is_completed },
    });
    refetch();
  }

  async function updateTitle(task: Task, newTitle: string) {
    if (!newTitle.trim()) return;
    await updateTaskTitle({
      variables: { id: task.id, title: newTitle },
    });
    refetch();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto"
    >
      <h2
        className={
          theme === "light"
            ? "text-4xl font-bold mb-10 text-black"
            : "text-4xl font-bold mb-10 text-white"
        }
      >
        Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          className={
            theme === "light"
              ? "w-full p-4 rounded-2xl border border-gray-300 bg-white text-black placeholder:text-gray-600 shadow focus:ring-2 focus:ring-blue-300"
              : "w-full p-4 rounded-2xl border border-slate-700 bg-[#111a2b] text-white placeholder:text-gray-400 shadow focus:ring-2 focus:ring-blue-900"
          }
          placeholder="Task title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className={
            theme === "light"
              ? "w-full p-4 rounded-2xl border border-gray-300 bg-white text-black placeholder:text-gray-600 shadow focus:ring-2 focus:ring-blue-300"
              : "w-full p-4 rounded-2xl border border-slate-700 bg-[#111a2b] text-white placeholder:text-gray-400 shadow focus:ring-2 focus:ring-blue-900"
          }
          placeholder="Tag (work, personal)"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        />

        <input
          type="date"
          className={
            theme === "light"
              ? "w-full p-4 rounded-2xl border border-gray-300 bg-white text-black placeholder:text-gray-600 shadow focus:ring-2 focus:ring-blue-300"
              : "w-full p-4 rounded-2xl border border-slate-700 bg-[#111a2b] text-white placeholder:text-gray-400 shadow focus:ring-2 focus:ring-blue-900"
          }
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <motion.button
        onClick={createTask}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.03 }}
        className="mb-10 px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 transition"
      >
        Add Task
      </motion.button>

      {loading && <p className="text-gray-500">Loading tasks...</p>}

      <AnimatePresence>
        <div className="space-y-4">
          {data?.tasks?.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 15, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.04 }}
              className={
                theme === "light"
                  ? "flex justify-between items-center bg-white shadow-md rounded-2xl p-5 border border-gray-200 hover:shadow-xl transition"
                  : "flex justify-between items-center bg-[#111a2b] shadow-lg rounded-2xl p-5 border border-[#1f2c3d] hover:shadow-xl transition"
              }
            >
              <div className="flex flex-col gap-2">
                <input
                  className={
                    "bg-transparent outline-none text-lg font-medium " +
                    (task.is_completed
                      ? "line-through text-gray-400"
                      : theme === "light"
                      ? "text-black"
                      : "text-white")
                  }
                  defaultValue={task.title}
                  onBlur={(e) => updateTitle(task, e.target.value)}
                />

                <div className="flex gap-3 text-sm">
                  {task.tag && (
                    <span
                      className={
                        theme === "light"
                          ? "px-3 py-1 rounded-full bg-blue-100 text-blue-700"
                          : "px-3 py-1 rounded-full bg-blue-900/40 text-blue-200"
                      }
                    >
                      #{task.tag}
                    </span>
                  )}

                  {task.due_date && (
                    <span
                      className={
                        theme === "light"
                          ? "px-3 py-1 rounded-full bg-amber-100 text-amber-700"
                          : "px-3 py-1 rounded-full bg-amber-900/40 text-amber-200"
                      }
                    >
                      Due: {task.due_date}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => toggleComplete(task)}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.07 }}
                  className={
                    task.is_completed
                      ? theme === "light"
                        ? "px-4 py-2 rounded-xl bg-gray-200 text-gray-700"
                        : "px-4 py-2 rounded-xl bg-slate-700 text-white"
                      : theme === "light"
                      ? "px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600"
                      : "px-4 py-2 rounded-xl bg-[#00c851] text-black hover:bg-[#00e060]"
                  }
                >
                  {task.is_completed ? "Undo" : "✓ Done"}
                </motion.button>

                <motion.button
                  onClick={async () => {
                    await deleteTask({ variables: { id: task.id } });
                    refetch();
                  }}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.07 }}
                  className={
                    theme === "light"
                      ? "px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600"
                      : "px-4 py-2 rounded-xl bg-[#ff4d4d] text-black hover:bg-[#ff6666]"
                  }
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {!loading && data?.tasks?.length === 0 && (
        <p className="text-gray-500 mt-8">No tasks yet — add one!</p>
      )}
    </motion.div>
  );
}
