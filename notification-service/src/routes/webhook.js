import prisma from "../db.js";

export default function webhookRoute(app) {
  app.post("/webhooks/task-event", async (req, res) => {
    try {
      const event = req.body.event;
      const data = event?.data?.new;

      if (!data) {
        return res.status(400).json({ error: "Invalid event payload" });
      }

      if (!data.due_date) {
        return res.status(200).json({ message: "No due_date, skipping." });
      }

      // TEMPORARY — until actual user system is linked
      const userId = 1;

      // Read user preferences
      const prefs = await prisma.userPreferences.findFirst({
        where: { user_id: userId }
      });

      // Default = 30 minutes before due date
      const offsetMin = prefs?.reminder_offset ?? 30;

      // Convert due_date from "YYYY-MM-DD" → Real JS Date (ISO DateTime required)
      const dueDate = new Date(data.due_date);
      if (isNaN(dueDate)) {
        return res.status(400).json({ error: "Invalid due_date format" });
      }

      // Calculate reminder time
      const fireAt = new Date(dueDate.getTime() - offsetMin * 60000);

      // ---- CREATE JOB ----
      await prisma.job.create({
        data: {
          task_id: data.id,
          user_id: userId,
          due_date: dueDate,   // MUST be a Date object
          fire_at: fireAt,
          processed: false,
        }
      });

      console.log(
        `Job queued for task ${data.id} (fire at ${fireAt.toISOString()})`
      );

      return res.json({
        status: "queued",
        task_id: data.id,
        fireAt: fireAt.toISOString(),
      });

    } catch (err) {
      console.error("Webhook error:", err);
      return res.status(500).json({ error: "webhook failed", details: err.message });
    }
  });
}
