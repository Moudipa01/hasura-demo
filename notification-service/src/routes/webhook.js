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

      // TEMP USER (until auth is implemented)
      const userId = 1;

      // ---- FETCH USER PREFERENCES ----
      const prefs = await prisma.userPreferences.findFirst({
        where: { user_id: userId },
      });

      const offsetMin = prefs?.reminder_offset ?? 30;

      // ---- FETCH USER EMAIL FROM Preferences ----
      const userEmail = prefs?.email ?? null; // <-- IMPORTANT

      // Convert due_date string to JS Date
      const dueDate = new Date(data.due_date);
      if (isNaN(dueDate)) {
        return res.status(400).json({ error: "Invalid due_date format" });
      }

      // Calculate reminder time
      const fireAt = new Date(dueDate.getTime() - offsetMin * 60000);

      await prisma.job.create({
        data: {
          task_id: data.id,
          task_title: data.title ?? null,
          user_id: userId,
          user_email: prefs?.email ?? null,
          due_date: dueDate,
          fire_at: fireAt,
          processed: false,
        },
      });

      console.log(
        `Job queued for task ${data.id}${
          data.title ? ` (${data.title})` : ""
        } | userEmail=${userEmail} | fire=${fireAt.toISOString()}`
      );

      return res.json({
        status: "queued",
        task_id: data.id,
        task_title: data.title ?? null,
        user_email: userEmail,
        fireAt: fireAt.toISOString(),
      });
    } catch (err) {
      console.error("Webhook error:", err);
      return res
        .status(500)
        .json({ error: "webhook failed", details: err.message });
    }
  });
}
