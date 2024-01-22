import { Scenes, Telegraf, session } from "telegraf";
import dotenv from "dotenv";
import {
  bapoolScene,
  formScene,
  reminderScene,
} from "./modules/bapool/index.js";
import { phoneScene } from "./modules/auth/index.js";
import { mainMenuKeyboard } from "./modules/keyboards.js";
import { getStatus } from "./modules/utils/getStatus.js";
import { startCron } from "./modules/cron.js";
import { setupMethods } from "./modules/bapool/methods.js";

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
export const bot = new Telegraf(BOT_TOKEN);

const stage = new Scenes.Stage(
  [phoneScene, bapoolScene, formScene, reminderScene],
  {
    default: "phone",
  }
);

bot.use(session());
bot.use(stage.middleware());

bot.hears("Home", async (ctx) => {
  const status = await getStatus(ctx.from.id);
  let message = "";

  message += "Hello, " + ctx.from.first_name + "!\n";
  if (status.bapoolReminderExists) {
    message += "Bapool reminder is set.\n";
  } else {
    message += "Bapool reminder is not set.\n";
  }

  ctx.reply(message, mainMenuKeyboard);
});

// auth
bot.start((ctx) => ctx.scene.enter("phone"));

// bapool
bot.hears("Bapool", (ctx) => ctx.scene.enter("bapool"));
bot.hears("Update the data", (ctx) => ctx.scene.enter("form"));
bot.hears("Setup the reminder", (ctx) => ctx.scene.enter("reminder"));
setupMethods(bot);

// cron
startCron(bot);

bot.launch();
