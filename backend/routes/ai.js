const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

router.post("/generate-description", async (req, res) => {
    try {
        const { title, location, country, category } = req.body;

        if (!title) {
            return res.status(400).json({ error: "Title is required to generate a description." });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "API key is not configured." });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Write a professional, catchy, and appealing 2-paragraph property description for a vacation rental listing.
Details:
- Title: ${title}
- Location: ${location || "Not specified"}
- Country: ${country || "Not specified"}
- Category: ${category || "General"}

Make it sound inviting and highlight the vibe based on the category and location. Do not use placeholders. Do not include a title in the response, just the 2 paragraphs of description.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ description: text.trim() });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "Failed to generate description. Please try again later." });
    }
});

module.exports = router;
