import prisma from "../db.js";

export default function webhookRoute(app) {
  app.post("/webhooks/task-event", async (req, res) => {
    try {
      const event = req.body.event;
      const data = event.data.new;

      if (!data || !data.due_date) {
        return res.status(200).json({ message: "No due_date, skipping." });
      }

      // For now user_id = 1 (later you will attach real users)
      const userId = 1;

      // Fetch user preference (default 30)
      const prefs = await prisma.userPreferences.findFirst({
        where: { user_id: userId },
      });

      const offsetMin = prefs?.reminder_offset ?? 30;

      const fireAt = new Date(
        new Date(data.due_date).getTime() - offsetMin * 60000
      );

      // Create a scheduled job
      // If the `Job` model doesn't exist in Prisma schema (prisma.job === undefined),
      // fall back to creating a `Notification` record so the webhook doesn't crash.
      //   if (prisma.job) {
      //     await prisma.job.create({
      //       data: {
      //         task_id: data.id,
      //         user_id: userId,
      //         due_date: data.due_date,
      //         fire_at: fireAt,
      //       }
      //     });

      //     return res.json({ status: "queued", fireAt });
      //   }

      // Fallback: create a Notification entry (existing model) describing the scheduled reminder.
      // This keeps the service running even if the Job model hasn't been added/generated yet.
      await prisma.notification.create({
        data: {
          user_id: userId,
          message: `Reminder planned for task ${
            data.id
          } at ${fireAt.toISOString()}`,
          status: "pending",
          task_id: data.id,
        },
      });

      return res.json({ status: "queued-fallback", fireAt });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "webhook failed" });
    }
  });
}
