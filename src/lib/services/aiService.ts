import { buildIntegrationContext } from "./mockData";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

interface GeminiContent {
  parts: { text: string }[];
  role: "user" | "model";
}

interface AICallOptions {
  messages: { role: "user" | "assistant"; content: string }[];
  systemPrompt?: string;
  integrations?: { type: string; enabled: boolean; mockDataKey: string; label: string }[];
}

export async function callAI(options: AICallOptions): Promise<{ text: string; steps: string[] }> {
  const steps: string[] = [];

  if (!GEMINI_API_KEY) {
    return { text: getFallbackResponse(options.messages), steps: ["⚡ Using fallback mode (no API key)"] };
  }

  const integrationContext = options.integrations ? buildIntegrationContext(options.integrations) : "";
  const enabledIntegrations = (options.integrations || []).filter((i) => i.enabled);

  if (enabledIntegrations.length > 0) {
    steps.push(`🔗 Connecting to: ${enabledIntegrations.map((i) => i.label).join(", ")}`);
    steps.push("📊 Fetching live data...");
  }

  steps.push("🤖 Generating AI response...");

  const systemInstruction = (options.systemPrompt || "You are a helpful AI sales assistant.") + integrationContext;

  const contents: GeminiContent[] = options.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  try {
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
      }),
    });

    if (res.status === 429) {
      steps.push("⚠️ Rate limit hit, using cached response");
      return { text: getFallbackResponse(options.messages), steps };
    }

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "I couldn't generate a response. Please try again.";
    return { text, steps };
  } catch (err) {
    console.error("AI call failed:", err);
    steps.push("⚠️ AI service unavailable, using fallback");
    return { text: getFallbackResponse(options.messages), steps };
  }
}

function getFallbackResponse(messages: { role: string; content: string }[]): string {
  const last = messages.at(-1)?.content?.toLowerCase() ?? "";
  if (last.includes("order") || last.includes("sales")) {
    return "Based on your recent orders data, I can see strong performance this week with 3 pending orders totaling ₹7,598. Your conversion rate of 3.8% is above industry average. Would you like me to analyze specific products or time periods?";
  }
  if (last.includes("lead") || last.includes("crm") || last.includes("contact")) {
    return "Your CRM shows 12 hot leads currently in pipeline. Vikram Nair (score: 87) has a demo scheduled — I'd recommend following up. Meera Joshi is qualified and ready for proposal. Shall I draft outreach messages?";
  }
  if (last.includes("hello") || last.includes("hi") || last.includes("hey")) {
    return "Hello! I'm your AI Sales Assistant powered by Debales AI. I can help you analyze sales data, manage leads, draft outreach, and more. What would you like to explore today?";
  }
  return "I'm here to help you grow your business! I can assist with sales analysis, lead management, customer insights, and strategic recommendations. What specific challenge can I help you tackle?";
}
