import axios from "axios";
import cheerio from "cheerio";

export const parseTable = async () => {
  const { data } = await axios.get("https://www.bapool.kz");
  const $ = cheerio.load(data);
  const tableData = [];

  $("tbody tr").each((index, element) => {
    const time = $(element).find("th").text();
    const data = [];

    $(element)
      .find("td")
      .each((i, el) => {
        const trackId = $(el).data("track-id");
        const timeId = $(el).data("time-id");
        const isAvailable = $(el).hasClass("bg-success");
        data.push({
          timeId,
          trackId,
          isAvailable,
        });
      });

    // Only push data if time is not empty
    if (time.trim() !== "") {
      tableData.push({ time, data });
    }
  });

  return tableData;
};
