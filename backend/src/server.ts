import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL_NAME = "llama3-8b-8192";

if (!GROQ_API_KEY) {
  throw new Error("❌ Missing GROQ_API_KEY in environment variables");
}

interface GroqApiResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface EvaluateRequest {
  question: string;
  correctAnswer: string;
  userAnswer: string;
}

function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen) + "..." : str;
}

const MAX_INPUT_LENGTH = 1500;

async function askGroq(prompt: string): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Groq API HTTP error:", response.status, errorText);
    throw new Error(`Groq API error: ${response.status}`);
  }

  const json = (await response.json()) as GroqApiResponse;
  const content = json?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("❌ Invalid response from Groq API");
  }

  return content.trim();
}

app.post("/evaluate", async (req: Request, res: Response) => {
  const { question, correctAnswer, userAnswer } = req.body as EvaluateRequest;

  if (!question || !correctAnswer || !userAnswer) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const q = truncate(question, MAX_INPUT_LENGTH);
  const ca = truncate(correctAnswer, MAX_INPUT_LENGTH);
  const ua = truncate(userAnswer, MAX_INPUT_LENGTH);

  const scorePrompt = `
Evaluate how semantically correct the user's answer is compared to the correct answer, focusing on the meaning rather than exact wording.

Question: ${q}
Correct Answer: ${ca}
User's Answer: ${ua}

Instructions:
- Analyze the meaning and intent behind both answers.
- Focus on whether the user captured the key ideas, not exact wording.
- Score the user's answer as a percentage:
  - 100% = fully correct or very close
  - 70% = mostly correct, but with some gaps
  - 50% = partial understanding, major gaps
  - 0% = incorrect or irrelevant

Return only the score as a number (e.g., 80), without a percent symbol or extra text.
`;

  const feedbackPrompt = `
Write feedback in no more than 2 lines explaining how the user's answer could be improved.

Question: ${q}
Correct Answer: ${ca}
User's Answer: ${ua}

Start directly with the feedback. Do not include any headings or intro. Keep it constructive and specific.
`;

  try {
    const scoreText = await askGroq(scorePrompt);
    const scoreMatch = scoreText.match(/\d{1,3}/);
    const scoreValue = scoreMatch ? Math.min(parseInt(scoreMatch[0]), 100) : 0;
    const score = `${scoreValue}%`;

    const feedbackRaw = await askGroq(feedbackPrompt);
    const feedbackClean = feedbackRaw.trim().split("\n").slice(0, 2).join(" ");
    const feedback = `${feedbackClean}\t.....{AI generated feedback.}`;

    res.json({
      question,
      correctAnswer,
      userAnswer,
      score,
      feedback,
    });
  } catch (err: any) {
    console.error("❌ Error evaluating answer:", err.message || err);

    res.status(500).json({
      question,
      correctAnswer,
      userAnswer,
      score: "0%",
      feedback: "Error processing answer. Please try again.\nAI generated feedback.",
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
