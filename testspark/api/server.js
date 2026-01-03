// api/server.js
const axios = require("axios");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      req.body,
      { headers: { "Content-Type": "application/json" } }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Vercel API Error:", error.response?.data || error.message);
    return res.status(500).json({ error: error.response?.data || error.message });
  }
};
