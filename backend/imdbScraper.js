
const axios = require("axios");
const cheerio = require("cheerio");


async function getIMDBRating(imdbId) {
  

  try {
    const url = `https://www.imdb.com/title/${imdbId}/`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    const $ = cheerio.load(response.data);
    const rating = $('span[class*="AggregateRatingButton__RatingScore"]').first().text();

    return rating || "N/A";
  } catch (err) {
    console.error("❌ Error fetching IMDb rating:", err.message);
    return "N/A";
  }
}

module.exports = { getIMDBRating };
