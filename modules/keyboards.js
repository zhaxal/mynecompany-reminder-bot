export const mainMenuKeyboard = {
  reply_markup: {
    keyboard: [["Bapool"]],
    resize_keyboard: true,
  },
};

export const timeKeyboard = {
  reply_markup: {
    keyboard: [
      ["6:00", "7:00", "8:00", "9:00", "10:00"],
      ["11:00", "12:00", "13:00", "14:00", "15:00"],
      ["16:00", "17:00", "18:00", "19:00", "20:00"],
      ["21:00", "22:00"],
      ["Cancel"],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  },
};

export const weekdaysKeyboard = {
  reply_markup: {
    keyboard: [
      ["Monday", "Tuesday", "Wednesday"],
      ["Thursday", "Friday", "Saturday", "Sunday"],
      ["Done"],
      ["Cancel"],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  },
};

export const bapoolMainMenuKeyboard = {
  reply_markup: {
    keyboard: [
      ["Update the data", "Setup the reminder", "Submit the bapool form"],
      ["Home"],
    ],
    resize_keyboard: true,
  },
};

export const cancelKeyboard = {
  reply_markup: {
    keyboard: [["Cancel"]],
    resize_keyboard: true,
    one_time_keyboard: true,
  },
};
