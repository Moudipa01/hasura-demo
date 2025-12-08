"use client";

import { useEffect, useState } from "react";
import { useTheme } from "../../layout";

type Preferences = {
  email: string;
  reminderMinutes: number;
  enabled: boolean;
};

export default function NotificationSettings() {
  const { theme } = useTheme();
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchPrefs() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NOTIFICATION_API}/users/1/preferences`
      );
      const data = await res.json();

      // Map backend shape (reminder_offset) to frontend shape (reminderMinutes)
      const mapped: Preferences = {
        email: data?.email ?? "",
        reminderMinutes: data?.reminder_offset ?? 30,
        enabled: typeof data?.enabled === "boolean" ? data.enabled : true,
      };

      setPrefs(mapped);
    } catch (err) {
      console.error("Failed to fetch preferences:", err);
      setPrefs({ email: "", reminderMinutes: 30, enabled: true });
    } finally {
      setLoading(false);
    }
  }

  async function updatePrefs() {
    if (!prefs) return;

    try {
      // Send backend field `reminder_offset` which the API expects
      const body = {
        email: prefs.email,
        enabled: prefs.enabled,
        reminder_offset: prefs.reminderMinutes,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NOTIFICATION_API}/users/1/preferences`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) throw new Error(`Update failed: ${res.status}`);
      alert("Preferences saved.");
    } catch (err) {
      console.error(err);
      alert("Failed to save preferences.");
    }
  }

  useEffect(() => {
    fetchPrefs();
  }, []);

  if (loading || !prefs) return <p>Loading…</p>;

  return (
    <div className="max-w-xl mx-auto">
      <h1 className={theme === "light" ? "text-3xl font-bold mb-6 text-black" : "text-3xl font-bold mb-6 text-white"}>Notification Settings</h1>

      <div className="space-y-6">
        <div>
          <label className={theme === "light" ? "text-sm text-gray-700" : "text-sm text-slate-300"}>Email Address</label>
          <input
            type="email"
            className={
              theme === "light"
                ? "w-full mt-2 p-3 rounded-xl border border-gray-200 bg-white text-black"
                : "w-full mt-2 p-3 rounded-xl border border-slate-800 bg-[#0b1628] text-white"
            }
            value={prefs.email}
            onChange={(e) =>
              setPrefs((p) => ({ ...p!, email: e.target.value }))
            }
          />
        </div>

        <div>
          <label className={theme === "light" ? "text-sm text-gray-700" : "text-sm text-slate-300"}>Reminder Before (minutes)</label>
          <input
            type="number"
            className={
              theme === "light"
                ? "w-full mt-2 p-3 rounded-xl border border-gray-200 bg-white text-black"
                : "w-full mt-2 p-3 rounded-xl border border-slate-800 bg-[#0b1628] text-white"
            }
            value={prefs.reminderMinutes}
            onChange={(e) =>
              setPrefs((p) => ({
                ...p!,
                reminderMinutes: Number(e.target.value),
              }))
            }
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={prefs.enabled}
            onChange={(e) =>
              setPrefs((p) => ({ ...p!, enabled: e.target.checked }))
            }
            className={theme === "light" ? "accent-blue-600" : "accent-blue-400"}
          />
          <label className={theme === "light" ? "text-sm text-gray-700" : "text-sm text-slate-300"}>Enable Notifications</label>
        </div>

        <button
          onClick={updatePrefs}
          className={
            theme === "light"
              ? "px-6 py-3 bg-blue-600 text-white rounded-xl shadow"
              : "px-6 py-3 bg-blue-500 text-white rounded-xl shadow"
          }
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}
