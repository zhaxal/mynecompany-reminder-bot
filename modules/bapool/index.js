import { Scenes } from "telegraf";
import {
  mainMenuKeyboard,
  cancelKeyboard,
  bapoolMainMenuKeyboard,
  timeKeyboard,
  weekdaysKeyboard,
} from "../keyboards.js";
import { db } from "../../firebase.js";
import { getDoc, doc, setDoc } from "firebase/firestore";

export const formScene = new Scenes.WizardScene(
  "form",
  (ctx) => {
    ctx.reply("Please enter your first name:", cancelKeyboard);
    return ctx.wizard.next();
  },
  (ctx) => {
    if (ctx.message.text === "Cancel") {
      ctx.reply("Form cancelled.", mainMenuKeyboard);
      return ctx.scene.leave();
    }
    ctx.wizard.state.firstName = ctx.message.text;
    ctx.reply("Please enter your last name:", cancelKeyboard);
    return ctx.wizard.next();
  },
  (ctx) => {
    if (ctx.message.text === "Cancel") {
      ctx.reply("Form cancelled.", mainMenuKeyboard);
      return ctx.scene.leave();
    }
    ctx.wizard.state.lastName = ctx.message.text;
    ctx.reply("Please enter your card code:", cancelKeyboard);
    return ctx.wizard.next();
  },
  (ctx) => {
    if (ctx.message.text === "Cancel") {
      ctx.reply("Form cancelled.", mainMenuKeyboard);
      return ctx.scene.leave();
    }
    ctx.wizard.state.subscribeCode = ctx.message.text;
    ctx.reply("Please enter the time (from 6:00 to 22:00):", timeKeyboard);
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (ctx.message.text === "Cancel") {
      ctx.reply("Form cancelled.", mainMenuKeyboard);
      return ctx.scene.leave();
    }
    ctx.wizard.state.time = ctx.message.text;

    const docRef = doc(db, "bapool", String(ctx.from.id));

    await setDoc(docRef, {
      firstName: ctx.wizard.state.firstName,
      lastName: ctx.wizard.state.lastName,
      subscribeCode: ctx.wizard.state.subscribeCode,
      time: ctx.wizard.state.time,
    });

    ctx.reply(
      "Thank you! Your information has been saved.",
      bapoolMainMenuKeyboard
    );
    return ctx.scene.leave();
  }
);
export const bapoolScene = new Scenes.WizardScene("bapool", async (ctx) => {
  const docRef = doc(db, "bapool", String(ctx.from.id));
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return ctx.scene.enter("form");
  } else {
    ctx.scene.leave();
    return ctx.reply("Bapool", bapoolMainMenuKeyboard);
  }
});

export const reminderScene = new Scenes.WizardScene(
  "reminder",
  (ctx) => {
    ctx.wizard.state.weekdays = [];
    ctx.reply(
      "Please select the weekdays (press 'Done' when finished):",
      weekdaysKeyboard
    );
    return ctx.wizard.next();
  },
  (ctx) => {
    if (ctx.message.text === "Cancel") {
      ctx.reply("Form cancelled.", mainMenuKeyboard);
      return ctx.scene.leave();
    } else if (ctx.message.text === "Done") {
      if (ctx.wizard.state.weekdays.length === 0) {
        ctx.reply("You must select at least one weekday.");
      } else {
        ctx.reply("Please enter the time (from 6:00 to 22:00):", timeKeyboard);
        return ctx.wizard.next();
      }
    } else {
      ctx.wizard.state.weekdays.push(ctx.message.text);
      ctx.reply(`Selected weekdays: ${ctx.wizard.state.weekdays.join(", ")}`);
    }
  },
  async (ctx) => {
    if (ctx.message.text === "Cancel") {
      ctx.reply("Form cancelled.", mainMenuKeyboard);
      return ctx.scene.leave();
    }
    ctx.wizard.state.time = ctx.message.text;
    ctx.wizard.state.weekday = ctx.wizard.state.weekdays.join(",");

    const docRef = doc(db, "reminder", `bapool_${ctx.from.id}`);

    await setDoc(docRef, {
      weekday: ctx.wizard.state.weekday,
      time: ctx.wizard.state.time,
    });

    ctx.reply("Thank you! Your reminder has been set.", bapoolMainMenuKeyboard);
    return ctx.scene.leave();
  }
);
