import cron from "node-cron";
import prisma from "../db.js";

// Starts the reminder worker. Currently schedules a simple cron job
// that runs every minute and logs activity. This is a safe placeholder
// to avoid registering routes from the scheduler file and to prevent
// `app` being undefined when `startWorker()` is invoked from `server.js`.
export default function startWorker() {
  // Run every minute
  cron.schedule("* * * * *", async () => {
    try {
      console.log("[reminderWorker] tick - checking for due reminders...");

      // Placeholder: if you add a `Job` model later, query and process it here.
      // Example (requires `Job` model):
      // const jobs = await prisma.job.findMany({ where: { processed: false, fire_at: { lte: new Date() } } });
      // for (const job of jobs) { ... }

    } catch (err) {
      console.error("[reminderWorker] error:", err);
    }
  });

  console.log("Reminder worker started (cron scheduled every minute)");
}
