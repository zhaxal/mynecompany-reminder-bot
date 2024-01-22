import cron from "node-cron";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "../firebase.js";
import { parseTable } from "./parser.js";

export function startCron(bot) {
  const job = async () => {
    const querySnapshot = await getDocs(collection(db, "reminder"));
    const table = await parseTable();
    querySnapshot.forEach(async (qsDoc) => {
      const id = qsDoc.id;
      const data = qsDoc.data();

      const reminderWeekdays = data.weekday.split(",");

      const weekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const today = new Date();
      const weekday = weekdays[today.getDay()];

      if (!reminderWeekdays.includes(weekday)) {
        return;
      }

      const [provider, userId] = id.split("_");

      switch (provider) {
        case "bapool":
          let message = "Bapool reminder";
          const row = table.find((r) => r.time === data.time);
          const availableTracks = row.data.filter((t) => t.isAvailable);

          if (availableTracks.length === 0) {
            bot.telegram.sendMessage(userId, message + ": no available tracks");
            break;
          }

          const bapoolDoc = await getDoc(doc(db, `bapool/${userId}`));

          if (!bapoolDoc.exists()) {
            bot.telegram.sendMessage(userId, message + ": no bapool data");
            break;
          }

          // Include the keyboard in the message
          bot.telegram.sendMessage(userId, message, {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Submit the form",
                    callback_data: "submit_form_bapool",
                  },
                ],
              ],
            },
          });
          break;

        default:
          console.error(`Provider ${provider} not supported`);
          break;
      }
    });
  };

  // Run the job immediately
  job();

  // Schedule the job to run every day at 9 AM
  cron.schedule("0 9 * * *", job);
}
