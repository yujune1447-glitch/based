import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@/lib/auth";

const DAILY_PROMPTS = [
  "What moment today reminded you of God's faithfulness?",
  "Where did you feel the most peaceful today, and what do you think God was saying to you in that?",
  "Is there something you've been holding onto that you sense God is inviting you to release?",
  "What is one thing you're grateful for today that you didn't expect?",
  "Where have you seen beauty or grace show up in an ordinary way this week?",
  "What does it look like for you to trust God in your current season?",
  "Is there someone God has placed on your heart lately? What do you sense about that?",
  "How have you experienced rest or renewal lately — or what might be getting in the way of that?",
  "What would it look like to walk in greater freedom in one area of your life?",
  "What Scripture or truth has been on your mind recently, and why do you think that is?",
];

function getOpeningPrompt(): string {
  const index = new Date().getDate() % DAILY_PROMPTS.length;
  return DAILY_PROMPTS[index];
}

const SYSTEM_PROMPT = `You are a warm, spiritually grounded reflection companion in a faith-based accountability app called "based". 

Your role:
- Ask one thoughtful, open-ended question at a time
- Listen deeply and reflect back with warmth and spiritual insight
- Ground responses in grace, not performance or shame
- Draw from Christian tradition (Scripture, prayer, theology) naturally — not forcedly
- Keep responses concise (2-4 sentences), conversational, and gentle
- Never lecture or moralize — ask questions that open space
- Treat silence and struggle with the same reverence as celebration

Your tone is like a wise, caring spiritual director — curious, unhurried, full of warmth.`;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized — not logged in" }, { status: 401 });
    }

    const { messages, type } = await req.json();

    if (type === "opening") {
      return NextResponse.json({ content: getOpeningPrompt() });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY not set in Vercel env vars" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 200,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
        {
          role: "system",
          content: "Based on what the user just shared, respond with genuine warmth and ask one follow-up question to help them go deeper. Keep it under 3 sentences total.",
        },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "";
    return NextResponse.json({ content });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
