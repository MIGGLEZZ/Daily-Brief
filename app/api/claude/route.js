export async function POST(request) {
  const { prompt, systemPrompt } = await request.json();

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system:
        systemPrompt ||
        "You are a high-performance coach and daily briefing assistant for an elite athlete targeting Olympic competition. Be concise, sharp, motivating. Return valid JSON only — no markdown fences, no preamble.",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || "";
  return Response.json({ text });
}
