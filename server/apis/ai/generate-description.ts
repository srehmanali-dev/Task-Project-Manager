import { api, z, anthropic } from "@superblocksteam/sdk-api";

const ANTHROPIC_ID = "94b83554-951b-44dd-8ad1-dfa3af590acd";

const MessageResponseSchema = z.object({
  id: z.string(),
  type: z.literal("message"),
  role: z.literal("assistant"),
  content: z.array(
    z.object({
      type: z.literal("text"),
      text: z.string(),
    })
  ),
  model: z.string(),
  stop_reason: z.string().nullable(),
  stop_sequence: z.string().nullable(),
  usage: z.object({
    input_tokens: z.number(),
    output_tokens: z.number(),
  }),
});

export default api({
  name: "GenerateTaskDescription",
  description: "Generates a task description from a title using Claude Sonnet.",
  integrations: {
    ai: anthropic(ANTHROPIC_ID),
  },
  input: z.object({
    title: z.string().min(1),
    projectContext: z.string().nullable(),
  }),
  output: z.object({
    description: z.string(),
  }),
  async run(ctx, { title, projectContext }) {
    const systemPrompt = `You are a project management assistant. Given a task title, generate a clear, actionable task description (2-4 sentences). Include what needs to be done, acceptance criteria, and any relevant details. Be concise and professional.`;

    const userMessage = projectContext
      ? `Task title: "${title}"\nProject context: ${projectContext}\n\nGenerate a task description.`
      : `Task title: "${title}"\n\nGenerate a task description.`;

    // Per integration knowledge: always use Sonnet, never Opus or Fable
    const result = await ctx.integrations.ai.apiRequest(
      {
        method: "POST",
        path: "/v1/messages",
        body: {
          model: "claude-sonnet-4-6",
          max_tokens: 512,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }],
        },
      },
      { response: MessageResponseSchema },
      { label: "Generate task description with Claude" }
    );

    const textContent = result.content.find((c) => c.type === "text");
    return { description: textContent?.text ?? "" };
  },
});
