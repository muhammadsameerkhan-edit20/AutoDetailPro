const axios = require('axios');

// ─── Multi-Key Rotation System ────────────────────────────────────────────────
// Add up to 3 keys in .env as GEMINI_API_KEY_1, GEMINI_API_KEY_2, GEMINI_API_KEY_3
// The rotator will automatically switch to the next key if one hits a quota limit.
// Keys are tried in order: 1 → 2 → 3. If all fail, falls back to rule-based engine.

let currentKeyIndex = 0; // In-memory rotation state

const getApiKeys = () => {
    const keys = [
        process.env.GEMINI_API_KEY_1,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3,
    ].filter(k => k && k.trim().length > 10); // Only include non-empty keys
    return keys.map(k => k.trim());
};

const SYSTEM_PROMPT = `
You are the "AutoDetailPro Specialist" — an elite AI consultant for a premium automobile detailing business in Lahore, Pakistan (Phase 6 DHA).
Tone: Professional, enthusiastic, and highly knowledgeable about all aspects of car care and detailing.

Business Info:
- Location: Phase 6 DHA, Lahore
- Services: Basic Exterior Wash (Rs. 2,500), Interior Deep Cleaning, Paint Restoration, 9H Ceramic Coatings (Rs. 25,000+), Engine Bay Detailing, Mobile Doorstep Detailing
- Hours: 9AM - 8PM, Monday to Saturday
- Booking: Available instantly through the app's "Book Now" feature

Guidelines:
1. If the user asks about cars or detailing, answer with precision and technical expertise.
2. If the user asks something completely unrelated (science, history, etc.), answer helpfully and naturally.
3. Keep answers concise (2-4 sentences), professional, and use emojis sparingly.
4. Always respond in English.
`;

// ─── Try AI with multi-key rotation ──────────────────────────────────────────
const callGeminiWithRotation = async (message) => {
    const keys = getApiKeys();
    if (keys.length === 0) throw new Error("No API keys configured");

    const totalKeys = keys.length;
    let lastError = null;

    for (let attempt = 0; attempt < totalKeys; attempt++) {
        const keyIndex = (currentKeyIndex + attempt) % totalKeys;
        const key = keys[keyIndex];

        try {
            // Try gemini-2.5-flash (highest free tier availability)
            // Falls back to gemini-2.0-flash if 2.5 is unavailable
            let aiRes;
            try {
                aiRes = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
                    {
                        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
                        contents: [{ role: "user", parts: [{ text: message }] }],
                        generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
                    },
                    { timeout: 8000 }
                );
            } catch (modelErr) {
                if (modelErr.response?.status === 429 || modelErr.response?.status === 404) throw modelErr;
                // Try 2.0 as backup model
                aiRes = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
                    {
                        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
                        contents: [{ role: "user", parts: [{ text: message }] }],
                        generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
                    },
                    { timeout: 8000 }
                );
            }

            const text = aiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error("Empty AI response");

            // Successful — keep using this key index going forward
            currentKeyIndex = keyIndex;
            console.log(`[AI] ✅ Key #${keyIndex + 1} succeeded`);
            return text;

        } catch (err) {
            const status = err.response?.status;
            lastError = err;

            if (status === 429 || status === 403) {
                // Quota exhausted or forbidden — rotate to next key
                console.warn(`[AI] ⚠️ Key #${keyIndex + 1} hit ${status}. Rotating to next key...`);
                currentKeyIndex = (keyIndex + 1) % totalKeys;
                continue;
            } else {
                // Non-quota error (network, etc.) — throw immediately
                throw err;
            }
        }
    }

    // All keys exhausted
    console.error("[AI] ❌ All API keys exhausted. Falling back to rule-based engine.");
    throw lastError;
};

// ─── Rule-Based Expert Fallback ───────────────────────────────────────────────
const getRuleBasedResponse = (msg) => {
    if (msg.includes("ceramic") || msg.includes("coating") || msg.includes("protection")) {
        return "Elite protection for your ride! 🛡️ Our 9H Ceramic Coatings provide up to 5 years of extreme gloss and hydrophobic protection. Price starts at Rs. 25,000 for sedans.";
    } else if (msg.includes("service") || msg.includes("offer") || msg.includes("package") || msg.includes("wash")) {
        return "We offer: 🧼 Basic Exterior Wash (Rs. 2,500), Interior Deep Cleaning, Paint Restoration, Ceramic Coatings, and Engine Detailing. We also do Mobile Doorstep Detailing across Lahore!";
    } else if (msg.includes("price") || msg.includes("cost") || msg.includes("rupees") || msg.includes("rs") || msg.includes("rate")) {
        return "Our rates: ✨ Exterior Wash at Rs. 2,500, Full Detailing from Rs. 15,000, and Ceramic Coatings from Rs. 25,000+. Check our 'Services' page for the full list!";
    } else if (msg.includes("location") || msg.includes("address") || msg.includes("where") || msg.includes("map")) {
        return "We are located at Phase 6 DHA, Lahore. 📍 We also provide Doorstep Detailing across Lahore—we bring our own power and water to your home!";
    } else if (msg.includes("book") || msg.includes("appointment") || msg.includes("schedule") || msg.includes("reserve")) {
        return "Let's get your car shining! ✨ You can book a slot instantly by clicking the 'Book Now' button. It takes less than 60 seconds!";
    } else if (msg.includes("time") || msg.includes("duration") || msg.includes("long") || msg.includes("open") || msg.includes("hour")) {
        return "We are open 9AM - 8PM, Mon-Sat. ⏱️ A standard wash takes ~90 mins. A full ceramic coating needs 24 hours for proper curing.";
    } else if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
        return "Hello! I am your AutoDetailPro Specialist. How can I assist with your car care today? ✨";
    } else if (msg.includes("interior") || msg.includes("seat") || msg.includes("cabin") || msg.includes("leather")) {
        return "Our Interior Deep Cleaning uses steam sterilization and specialized chemicals to eliminate stains and odors, leaving your cabin factory-fresh! 🧼";
    } else if (msg.includes("engine") || msg.includes("bay")) {
        return "We perform professional Engine Bay Detailing using degreasers and protective coatings—making your engine look as good as new while protecting components!";
    } else {
        return "Great question! 🚗 For detailed advice, I recommend visiting our Services page or booking a free consultation with our expert team at our DHA Phase 6 shop!";
    }
};

// ─── Main Handler ─────────────────────────────────────────────────────────────
// @desc    Chatbot handler with Gemini AI + Multi-Key Rotation + Rule-based Fallback
// @route   POST /api/chatbot
// @access  Public
exports.handleChat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

        let response = "";

        try {
            response = await callGeminiWithRotation(message);
        } catch (aiErr) {
            console.warn("[AI] Using rule-based fallback:", aiErr.message);
            response = getRuleBasedResponse(message.toLowerCase());
        }

        res.status(200).json({ success: true, response });

    } catch (err) {
        console.error("CRITICAL CHAT ERROR:", err.message);
        res.status(200).json({
            success: true,
            response: "I'm experiencing a brief signal interference! 🔧 Our packages start from Rs. 2,500. Please try again or check our Services page!"
        });
    }
};

// @desc    Get API Key rotation status (Admin only diagnostic)
// @route   GET /api/chatbot/status
// @access  Public (for debugging — can be protected in production)
exports.getChatStatus = (req, res) => {
    const keys = getApiKeys();
    res.status(200).json({
        success: true,
        totalKeys: keys.length,
        activeKeyIndex: currentKeyIndex + 1,
        keysConfigured: keys.map((k, i) => `Key #${i + 1}: ${k.substring(0, 12)}...`)
    });
};
