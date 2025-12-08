import express from "express";
import cors from "cors";
import webhookRoute from "./routes/webhook.js";
import preferencesRoute from "./routes/preferences.js";
import notificationsRoute from "./routes/notifications.js";
import startWorker from "./scheduler/reminderWorker.js";

const app = express();
app.use(cors());
app.use(express.json());

// Routes
webhookRoute(app);
preferencesRoute(app);
notificationsRoute(app);

// Start cron worker
startWorker();

app.get("/", (req, res) => {
  res.send("Notification microservice is running!");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Microservice running on ${PORT}`));
