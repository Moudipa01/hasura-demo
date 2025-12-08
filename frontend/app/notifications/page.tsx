"use client";

import { useEffect, useState } from "react";
import { useTheme } from "../layout";

type Notification = {
  id: string;
  taskId: number | null;
  message: string;
  createdAt: string;
  read: boolean;
};

export default function NotificationsPage() {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchNotifications() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NOTIFICATION_API}/notifications`
      );
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <h1
        className={
          theme === "light"
            ? "text-4xl font-bold mb-8 text-black"
            : "text-4xl font-bold mb-8 text-white"
        }
      >
        Notifications
      </h1>

      {loading && <p className={theme === "light" ? "text-gray-700" : "text-slate-300"}>Loading…</p>}

      {!loading && notifications.length === 0 && (
        <p className={theme === "light" ? "text-gray-500" : "text-slate-400"}>No notifications yet.</p>
      )}

      <div className="space-y-4">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={
              theme === "light"
                ? "p-4 bg-white border border-gray-200 rounded-xl shadow"
                : "p-4 bg-[#0b1628] border border-slate-800 rounded-xl shadow"
            }
          >
            <p className={theme === "light" ? "font-medium text-black" : "font-medium text-white"}>{n.message}</p>
            <p className={theme === "light" ? "text-xs text-gray-600 mt-1" : "text-xs text-slate-400 mt-1"}>
              {isNaN(Date.parse(n.createdAt)) ? "Invalid Date" : new Date(n.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
