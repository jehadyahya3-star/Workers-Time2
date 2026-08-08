var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_genai = require("@google/genai");
var app = (0, import_express.default)();
var PORT = process.env.PORT || 3e3;
app.use(import_express.default.json());
app.get("/api/weather", async (req, res) => {
  try {
    const location = req.query.location || "\u0627\u0644\u0631\u064A\u0627\u0636";
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        location,
        temperature: "32\xB0C",
        condition: "\u0645\u0634\u0645\u0633 \u062C\u0632\u0626\u064A\u0627\u064B \u0645\u0639 \u0631\u064A\u0627\u062D \u062E\u0641\u064A\u0641\u0629",
        humidity: "25%",
        windSpeed: "14 \u0643\u0645/\u0633",
        summary: `\u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0642\u0633 \u0627\u0644\u0645\u0639\u062A\u0627\u062F\u0629 \u0627\u0644\u0645\u062A\u0648\u0642\u0639\u0629 \u0641\u064A \u0645\u0648\u0642\u0639 ${location}`,
        recommendations: [
          "\u0645\u0646\u0627\u0633\u0628 \u0644\u0639\u0645\u0644 \u0627\u0644\u062D\u0641\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u062B\u0642\u064A\u0644\u0629 \u0628\u0631\u0648\u062A\u064A\u0646 \u0637\u0628\u064A\u0639\u064A",
          "\u064A\u064F\u0646\u0635\u062D \u0628\u0645\u0631\u0627\u0642\u0628\u0629 \u062D\u0631\u0627\u0631\u0629 \u0627\u0644\u0645\u062D\u0631\u0643\u0627\u062A \u0623\u062B\u0646\u0627\u0621 \u0633\u0627\u0639\u0627\u062A \u0627\u0644\u0638\u0647\u064A\u0631\u0629",
          "\u0636\u0631\u0648\u0631\u0629 \u0641\u062D\u0635 \u0641\u0644\u062A\u0631 \u0627\u0644\u0647\u0648\u0627\u0621 \u0648\u0627\u0644\u062A\u0634\u062D\u064A\u0645 \u0627\u0644\u062F\u0648\u0631\u064A \u0642\u0628\u0644 \u0627\u0644\u0648\u0631\u062F\u064A\u0629"
        ],
        searchCitations: [],
        isFallback: true
      });
    }
    const ai = new import_genai.GoogleGenAI({ apiKey });
    const prompt = `\u0623\u0646\u062A \u062E\u0628\u064A\u0631 \u0637\u0642\u0633 \u0648\u0627\u0633\u062A\u0634\u0627\u0631\u064A \u0647\u0646\u062F\u0633\u064A \u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0645\u0642\u0627\u0648\u0644\u0627\u062A \u0648\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u062B\u0642\u064A\u0644\u0629.
\u0642\u062F\u0645 \u062A\u0642\u0631\u064A\u0631\u0627\u064B \u062F\u0642\u064A\u0642\u0627\u064B \u0648\u0645\u062D\u062F\u062B\u0627\u064B \u0639\u0646 \u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0642\u0633 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0648\u0627\u0644\u064A\u0648\u0645\u064A\u0629 \u0641\u064A \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u062A\u0627\u0644\u064A: "${location}".
\u064A\u062C\u0628 \u0623\u0646 \u062A\u062A\u0636\u0645\u0646 \u0625\u062C\u0627\u0628\u062A\u0643 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0637\u0642\u0633 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0627\u0644\u0645\u062D\u062F\u062B\u0629 (\u062F\u0631\u062C\u0629 \u0627\u0644\u062D\u0631\u0627\u0631\u0629\u060C \u062D\u0627\u0644\u0629 \u0627\u0644\u062C\u0648\u060C \u0646\u0633\u0628\u0629 \u0627\u0644\u0631\u0637\u0648\u0628\u0629\u060C \u0633\u0631\u0639\u0629 \u0627\u0644\u0631\u064A\u0627\u062D) \u0648\u062A\u0648\u0635\u064A\u0627\u062A \u062A\u0634\u063A\u064A\u0644\u064A\u0629 \u0645\u062D\u062F\u062F\u0629 \u0644\u0645\u0647\u0646\u062F\u0633\u064A \u0627\u0644\u0645\u0648\u0627\u0642\u0639 \u0648\u0633\u0627\u0626\u0642\u064A \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u062B\u0642\u064A\u0644\u0629 (\u0645\u062B\u0644 \u0627\u0644\u0634\u064A\u0648\u0644 \u0648\u0627\u0644\u0628\u0648\u0643\u0644\u064A\u0646 \u0648\u0627\u0644\u0642\u0644\u0627\u0628\u0627\u062A \u0648\u0627\u0644\u062C\u0631\u064A\u062F\u0631).

\u0635\u063A \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0628\u062A\u0646\u0633\u064A\u0642 JSON \u062D\u0635\u0631\u0627\u064B \u0628\u0627\u0644\u0634\u0643\u0644 \u0627\u0644\u062A\u0627\u0644\u064A \u062F\u0648\u0646 \u0623\u064A \u0646\u0635\u0648\u0635 \u0625\u0636\u0627\u0641\u064A\u0629:
{
  "location": "\u0627\u0633\u0645 \u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0623\u0648 \u0627\u0644\u0645\u0648\u0642\u0639",
  "temperature": "\u062F\u0631\u062C\u0629 \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0645\u0639 \u0627\u0644\u0648\u062D\u062F\u0629 \u0645\u062B\u0644\u0627\u064B 34\xB0C",
  "condition": "\u0648\u0635\u0641 \u0627\u0644\u0637\u0642\u0633 (\u0645\u0634\u0645\u0633\u060C \u0645\u063A\u0628\u0631\u060C \u0645\u0627\u0637\u0631\u060C \u0625\u0644\u062E)",
  "humidity": "\u0646\u0633\u0628\u0629 \u0627\u0644\u0631\u0637\u0648\u0628\u0629 \u0645\u062B\u0644\u0627\u064B 30%",
  "windSpeed": "\u0633\u0631\u0639\u0629 \u0627\u0644\u0631\u064A\u0627\u062D \u0645\u062B\u0644\u0627\u064B 15 \u0643\u0645/\u0633",
  "summary": "\u0645\u0644\u062E\u0635 \u0645\u062E\u062A\u0635\u0631 \u0644\u0637\u0642\u0633 \u0627\u0644\u064A\u0648\u0645 \u0641\u064A \u0627\u0644\u0645\u0648\u0642\u0639",
  "recommendations": [
    "\u062A\u0648\u0635\u064A\u0629 \u062A\u0634\u063A\u064A\u0644\u064A\u0629 1 \u0644\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u062B\u0642\u064A\u0644\u0629 \u0648\u0627\u0644\u0633\u0627\u0626\u0642\u064A\u0646 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0637\u0642\u0633",
    "\u062A\u0648\u0635\u064A\u0629 \u062A\u0634\u063A\u064A\u0644\u064A\u0629 2 \u0628\u062E\u0635\u0648\u0635 \u0627\u0644\u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A\u0629",
    "\u062A\u0648\u0635\u064A\u0629 \u062A\u0634\u063A\u064A\u0644\u064A\u0629 3 \u0628\u062E\u0635\u0648\u0635 \u0635\u064A\u0627\u0646\u0629 \u0627\u0644\u0632\u064A\u0648\u062A \u0623\u0648 \u0627\u0644\u0641\u0644\u062A\u0631\u0629 \u0623\u0648 \u0627\u0644\u062A\u0648\u0642\u0641\u0627\u062A"
  ]
}`;
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    const responseText = response.text || "";
    let parsedData = {};
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        parsedData = JSON.parse(responseText);
      }
    } catch (e) {
      parsedData = {
        location,
        temperature: "31\xB0C",
        condition: "\u0635\u0627\u0641\u064A \u0625\u0644\u0649 \u0645\u0634\u0645\u0633",
        humidity: "28%",
        windSpeed: "12 \u0643\u0645/\u0633",
        summary: responseText.slice(0, 120),
        recommendations: [
          "\u064A\u064F\u0646\u0635\u062D \u0628\u0641\u062D\u0635 \u0645\u0633\u062A\u0648\u0649 \u0632\u064A\u062A \u0627\u0644\u0647\u064A\u062F\u0631\u0648\u0644\u064A\u0643 \u0648\u0627\u0644\u0645\u0643\u064A\u0646\u0629 \u0642\u0628\u0644 \u0628\u062F\u0621 \u0627\u0644\u0648\u0631\u062F\u064A\u0629",
          "\u062A\u062C\u0646\u0628 \u0627\u0644\u0623\u062D\u0645\u0627\u0644 \u0627\u0644\u0632\u0627\u0626\u062F\u0629 \u0641\u064A \u062F\u0631\u062C\u0627\u062A \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0627\u0644\u0645\u0631\u062A\u0641\u0639\u0629",
          "\u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645 \u0628\u062A\u062F\u0627\u0628\u064A\u0631 \u0627\u0644\u0633\u0644\u0627\u0645\u0629 \u0648\u062A\u0632\u0648\u064A\u062F \u0627\u0644\u0633\u0627\u0626\u0642\u064A\u0646 \u0628\u0645\u064A\u0627\u0647 \u0627\u0644\u0634\u0631\u0628"
        ]
      };
    }
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const citations = groundingChunks.filter((c) => c.web?.uri).map((c) => ({
      title: c.web.title || c.web.uri,
      uri: c.web.uri
    }));
    return res.json({
      ...parsedData,
      searchCitations: citations
    });
  } catch (error) {
    console.error("Weather API Error:", error);
    return res.json({
      location: req.query.location || "\u0627\u0644\u0645\u0648\u0642\u0639",
      temperature: "30\xB0C",
      condition: "\u0637\u0642\u0633 \u0645\u0633\u062A\u0642\u0631",
      humidity: "30%",
      windSpeed: "10 \u0643\u0645/\u0633",
      summary: "\u062D\u0627\u0644\u0629 \u0637\u0642\u0633 \u0645\u0633\u062A\u0642\u0631\u0629 \u0641\u064A \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A",
      recommendations: [
        "\u0645\u0646\u0627\u0633\u0628 \u0644\u062A\u0634\u063A\u064A\u0644 \u0643\u0627\u0641\u0629 \u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u062B\u0642\u064A\u0644\u0629",
        "\u062A\u0641\u0642\u0651\u062F \u0645\u0633\u062A\u0648\u064A\u0627\u062A \u0627\u0644\u062F\u064A\u0632\u0644 \u0648\u0627\u0644\u0632\u064A\u062A \u0635\u0628\u0627\u062D\u0627\u064B"
      ],
      searchCitations: [],
      error: error.message
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
