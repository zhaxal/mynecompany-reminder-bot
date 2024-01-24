import { getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { parseTable } from "../parser.js";
import axios from "axios";

function jsonToQueryString(json) {
  return Object.keys(json)
    .map(function (key) {
      if (json[key] === null || json[key] === undefined) {
        return "";
      }
      return encodeURIComponent(key) + "=" + encodeURIComponent(json[key]);
    })
    .join("&");
}

const formFunc = async (ctx) => {
  const isMessage = !!ctx.message;

  const userId = ctx.from.id;
  const table = await parseTable();
  const reminderDoc = await getDoc(doc(db, `reminder/bapool_${userId}`));
  const bapoolDoc = await getDoc(doc(db, `bapool/${userId}`));

  const reminderData = reminderDoc.data();

  const reminderWeekdays = reminderData.weekday.split(",");

  const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const today = new Date();
  const weekday = weekdays[today.getDay()];

  if (!reminderWeekdays.includes(weekday)) {
    ctx.reply("You can only submit the form on weekdays.");

    if (!isMessage) {
      ctx.answerCbQuery();
    }

    return;
  }

  if (!bapoolDoc.exists()) {
    ctx.reply("You need to fill out the form first.");
    if (!isMessage) {
      ctx.answerCbQuery();
    }
    return;
  }

  const row = table.find((r) => r.time === reminderData.time);
  const availableTracks = row.data.filter((t) => t.isAvailable);

  if (availableTracks.length === 0) {
    ctx.reply("No available tracks");
    if (!isMessage) {
      ctx.answerCbQuery();
    }
    return;
  }

  const bapoolData = bapoolDoc.data();

  function formatPhoneNumber(phoneNumberString) {
    let cleaned = ("" + phoneNumberString).replace(/\D/g, "");
    let match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);
    if (match) {
      return (
        "+" +
        match[1] +
        " (" +
        match[2] +
        ") " +
        match[3] +
        "-" +
        match[4] +
        "-" +
        match[5]
      );
    }
    return null;
  }

  let number = ctx.session.phone;
  if (!number) {
    ctx.reply("Please enter your phone number", {
      reply_markup: {
        keyboard: [
          [
            {
              text: "Enter phone number",
              request_contact: true,
            },
          ],
        ],
        resize_keyboard: true,
      },
    });
    if (!isMessage) {
      ctx.answerCbQuery();
    }
    return;
  }
  let formattedNumber = formatPhoneNumber(number);

  // Get the current date
  let currentDate = new Date();

  // Format the date
  let formattedDate =
    currentDate.getDate() +
    "-" +
    (currentDate.getMonth() + 1) +
    "-" +
    currentDate.getFullYear();

  try {
    const data = jsonToQueryString({
      track_id: String(availableTracks[0].trackId),
      time_id: String(availableTracks[0].timeId),
      first_name: bapoolData.firstName,
      last_name: bapoolData.lastName,
      tariff_id: "0",
      coach_id: "",
      subscribe_code: bapoolData.subscribeCode,
      date: formattedDate,
      phone: formattedNumber,
    });
    await axios.post("https://www.bapool.kz/v1/booking/create", data);
  } catch (error) {
    console.error(error);
    ctx.reply("Error submitting the form");
    if (!isMessage) {
      ctx.answerCbQuery();
    }
    return;
  }

  ctx.reply("Form submitted successfully");
  if (!isMessage) {
    ctx.answerCbQuery();
  }
};

export const setupMethods = (bot) => {
  bot.action("submit_form_bapool", formFunc);
  bot.hears("Submit the bapool form", formFunc);
};
