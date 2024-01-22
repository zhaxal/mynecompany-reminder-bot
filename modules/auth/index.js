import { Scenes, Markup } from "telegraf";
import { mainMenuKeyboard } from "../keyboards.js";

export const phoneScene = new Scenes.BaseScene("phone");
phoneScene.enter((ctx) =>
  ctx.reply("Please, enter your phone number", {
    reply_markup: {
      keyboard: [[Markup.button.contactRequest("Send my number")]],
      one_time_keyboard: true,
      resize_keyboard: true,
    },
  })
);

phoneScene.on("contact", (ctx) => {
  if (ctx.message.contact.user_id === ctx.from.id) {
    ctx.session.phone = ctx.message.contact.phone_number;
    ctx.reply("Thank you! You are now authenticated.", mainMenuKeyboard);
    ctx.scene.leave();
  } else {
    ctx.reply("Please send your own contact information.");
  }
});
