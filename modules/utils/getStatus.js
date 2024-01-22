import { db } from "../../firebase.js";
import { doc, getDoc } from "firebase/firestore";

export const getStatus = async (userId) => {
  try {
    const bapoolReminderRef = doc(db, `reminder/bapool_${userId}`);
    const bapoolReminder = await getDoc(bapoolReminderRef);
    const bapoolReminderExists = bapoolReminder.exists();

    return {
      bapoolReminderExists,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
