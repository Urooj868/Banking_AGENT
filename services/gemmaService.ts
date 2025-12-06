import { AccountType } from "../types";

// Tool Definitions
interface Tool {
  name: string;
  description: string;
  parameters?: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

const verifyBiometricsTool: Tool = {
  name: "trigger_biometric_verification",
  description:
    "Triggers the system's biometric verification process (camera scan) for the user. Call this when you need to verify the user's identity before proceeding.",
  parameters: {
    type: "object",
    properties: {},
  },
};

const collectAccountDetailsTool: Tool = {
  name: "collect_account_details",
  description:
    "Displays a structured input form to the user to collect their Name, ID, Account Type, and related details (Employment or Passport). Call this immediately after biometric verification is successful to gather account information.",
  parameters: {
    type: "object",
    properties: {},
  },
};

const verifyNadraTool: Tool = {
  name: "verify_with_nadra",
  description:
    "Verifies the user's Identity Card number against the National Database (NADRA) to ensure validity and check for existing bank accounts. ONLY call this ONCE after the account form is completely filled. Do not call this tool more than once per conversation.",
  parameters: {
    type: "object",
    properties: {
      identityCard: {
        type: "string",
        description: "The Identity Card Number to verify",
      },
    },
    required: ["identityCard"],
  },
};

const createAccountTool: Tool = {
  name: "create_account",
  description:
    "Finalizes the account opening. Call this ONLY after NADRA verification returns success and confirms the user does not already exist. Can be called after biometric verification (with biometric data) or after form submission, depending on the flow chosen.",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string", description: "Full name of the user" },
      accountType: {
        type: "string",
        description: "Type of account: LOCAL or NON_LOCAL",
      },
      identityCard: { type: "string", description: "ID Card Number" },
      employer: { type: "string", description: "Employer name (if Local)" },
      salary: { type: "string", description: "Salary range (if Local)" },
      passportUploaded: {
        type: "boolean",
        description: "True if passport was uploaded (for Non-Local)",
      },
    },
    required: ["name", "accountType", "identityCard"],
  },
};

const processTransactionTool: Tool = {
  name: "process_transaction",
  description:
    "Processes a mock transaction (deposit, transfer, payment). Call this when the user wants to move money.",
  parameters: {
    type: "object",
    properties: {
      type: { type: "string", description: "DEBIT or CREDIT" },
      amount: { type: "number", description: "Amount to transact" },
      description: {
        type: "string",
        description: "Description of transaction",
      },
    },
    required: ["type", "amount", "description"],
  },
};

const tools: Tool[] = [
  verifyBiometricsTool,
  collectAccountDetailsTool,
  verifyNadraTool,
  createAccountTool,
  processTransactionTool,
];

const SYSTEM_INSTRUCTION = `You are Vault, a banking AI agent. Follow this workflow EXACTLY:

WORKFLOW - OPTION A (WITH FORM):
1. User says "I want to open account"
   → Say: "I'll help you open an account. Let me verify your identity first."
   → Call: [TOOL_CALL: trigger_biometric_verification({})]
   → STOP. Wait for biometric result.

2. After biometric SUCCESS:
   → Say: "Great! Now I need your account details."
   → Call: [TOOL_CALL: collect_account_details({})]
   → STOP. Wait for user to fill form.

3. After form is COMPLETELY FILLED:
   → Say: "Verifying your identity in our system."
   → Call: [TOOL_CALL: verify_with_nadra({"identityCard": "VALUE_FROM_FORM"})]
   → STOP. Wait for NADRA result.

4. If NADRA says "SUCCESS" and "User does not exist":
   → Say: "Creating your account now."
   → Call: [TOOL_CALL: create_account({...all data...})]
   → STOP.

WORKFLOW - OPTION B (FAST TRACK - BIOMETRIC ONLY):
1. User says "I want to open account"
   → Say: "I'll help you open an account. Let me verify your identity first."
   → Call: [TOOL_CALL: trigger_biometric_verification({})]
   → STOP. Wait for biometric result.

2. After biometric SUCCESS:
   → If biometric result includes user data (name, ID):
     → Say: "Great! I have your details. Verifying with our system."
     → Call: [TOOL_CALL: verify_with_nadra({"identityCard": "ID_FROM_BIOMETRIC"})]
     → STOP. Wait for NADRA result.

3. If NADRA says "SUCCESS" and "User does not exist":
   → Say: "Creating your account now."
   → Call: [TOOL_CALL: create_account({...data from biometric...})]
   → STOP.

CRITICAL RULES:
- ONLY call verify_with_nadra ONE TIME per conversation
- DO NOT call verify_with_nadra multiple times
- DO NOT call verify_with_nadra before form is filled (in Option A) or without biometric data (in Option B)
- DO NOT retry NADRA verification
- Always wait for tool results before proceeding
- Use format: [TOOL_CALL: name(args)]
- Choose Option A (form) OR Option B (fast track) based on biometric result
`;

export class GemmaService {
  private llamaCppUrl: string;
  private conversationHistory: Array<{ role: string; content: string }> = [];
  // Track which tools have been called to prevent loops
  private toolsCalledThisConversation: Set<string> = new Set();

  constructor() {
    // Use proxy URL for CORS compatibility
    this.llamaCppUrl = "/api/llama";
    console.log(
      `[GemmaService] Initialized with Llama.cpp proxy at ${this.llamaCppUrl}`
    );
  }

  private formatToolsForPrompt(): string {
    return `
Available tools:
${tools
  .map(
    (tool) => `
- ${tool.name}: ${tool.description}
${
  tool.parameters
    ? `  Parameters: ${JSON.stringify(tool.parameters, null, 2)}`
    : "  No parameters"
}
`
  )
  .join("\n")}
`;
  }

  private parseToolCalls(text: string): Array<{ name: string; args: any }> {
    const toolCalls: Array<{ name: string; args: any }> = [];

    // Multiple regex patterns to catch different tool call formats
    const patterns = [
      // Pattern 1: [TOOL_CALL: name(args)]
      /\[TOOL_CALL:\s*(\w+)\s*\((.*?)\)\]/g,
      // Pattern 2: <tool_call>name(args)</tool_call>
      /<tool_call>\s*(\w+)\s*\((.*?)\)\s*<\/tool_call>/g,
      // Pattern 3: {{tool_name}}(args)
      /\{\{(\w+)\}\}\s*\((.*?)\)/g,
      // Pattern 4: `tool_name(args)` with backticks
      /`(\w+)\s*\((.*?)\)`/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const toolName = match[1];
        const argsStr = match[2];

        // CRITICAL: Prevent verify_with_nadra from being called multiple times
        if (toolName === "verify_with_nadra") {
          if (this.toolsCalledThisConversation.has(toolName)) {
            console.warn(
              `[GemmaService] BLOCKED: verify_with_nadra already called once in this conversation. Preventing duplicate call.`
            );
            continue; // Skip this tool call
          }
        }

        try {
          // Try to parse as JSON
          const args = JSON.parse(argsStr);
          toolCalls.push({ name: toolName, args });
          this.toolsCalledThisConversation.add(toolName);
          console.log(`[GemmaService] Parsed tool call: ${toolName}`, args);
        } catch (e) {
          // If not valid JSON, try as empty object
          if (argsStr.trim() === "" || argsStr.trim() === "{}") {
            toolCalls.push({ name: toolName, args: {} });
            this.toolsCalledThisConversation.add(toolName);
            console.log(
              `[GemmaService] Parsed tool call (empty args): ${toolName}`
            );
          } else {
            console.error(
              `[GemmaService] Failed to parse tool args for ${toolName}: "${argsStr}"`,
              e
            );
          }
        }
      }
    }

    // Safety: If no tool calls found but text mentions specific actions, infer them
    if (toolCalls.length === 0) {
      const lowerText = text.toLowerCase();

      // Check if model is talking about biometric verification but didn't format it
      if (
        (lowerText.includes("biometric") || lowerText.includes("verify")) &&
        !lowerText.includes("already") &&
        !lowerText.includes("failed") &&
        !this.toolsCalledThisConversation.has("trigger_biometric_verification")
      ) {
        console.log(
          "[GemmaService] Inferring biometric verification tool from context"
        );
        toolCalls.push({ name: "trigger_biometric_verification", args: {} });
        this.toolsCalledThisConversation.add("trigger_biometric_verification");
      }

      // Check if model is talking about account details but didn't format it
      if (
        lowerText.includes("account details") &&
        lowerText.includes("form") &&
        !this.toolsCalledThisConversation.has("collect_account_details")
      ) {
        console.log(
          "[GemmaService] Inferring collect_account_details tool from context"
        );
        toolCalls.push({ name: "collect_account_details", args: {} });
        this.toolsCalledThisConversation.add("collect_account_details");
      }
    }

    if (toolCalls.length > 0) {
      console.log(
        `[GemmaService] Found ${toolCalls.length} tool calls in response`
      );
    }

    return toolCalls;
  }

  async sendMessage(
    message: string,
    onToolCall: (name: string, args: any) => Promise<any>
  ): Promise<string> {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        role: "user",
        content: message,
      });

      let finalResponse = "";
      let continueLoop = true;

      while (continueLoop) {
        // Build the prompt with conversation history and available tools
        const systemPrompt =
          SYSTEM_INSTRUCTION + "\n\n" + this.formatToolsForPrompt();

        const prompt =
          this.conversationHistory
            .map(
              (msg) =>
                `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
            )
            .join("\n") + "\nAssistant:";

        // Call Llama.cpp API
        const response = await fetch(`${this.llamaCppUrl}/v1/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: systemPrompt + "\n\n" + prompt,
            max_tokens: 1000,
            temperature: 0.7,
            top_p: 0.9,
            stop: ["User:", "Assistant:"],
          }),
        });

        if (!response.ok) {
          throw new Error(`Llama.cpp API error: ${response.status}`);
        }

        const data = await response.json();
        const assistantResponse = data.choices[0]?.text?.trim() || "";

        console.log("[GemmaService] Model response:", assistantResponse);

        // Add assistant response to conversation history
        this.conversationHistory.push({
          role: "assistant",
          content: assistantResponse,
        });

        // Check for tool calls in the response
        const toolCalls = this.parseToolCalls(assistantResponse);

        if (toolCalls.length > 0) {
          // Process tool calls
          for (const toolCall of toolCalls) {
            console.log(
              `[GemmaService] Tool Call: ${toolCall.name}`,
              toolCall.args
            );

            try {
              const result = await onToolCall(toolCall.name, toolCall.args);

              // Add tool result to conversation
              this.conversationHistory.push({
                role: "user",
                content: `Tool ${toolCall.name} result: ${JSON.stringify(
                  result
                )}`,
              });
            } catch (error) {
              console.error(`[GemmaService] Tool execution error:`, error);
              this.conversationHistory.push({
                role: "user",
                content: `Tool ${toolCall.name} failed: ${error}`,
              });
            }
          }
        } else {
          // No tool calls, we're done
          finalResponse = assistantResponse;
          continueLoop = false;
        }
      }

      return finalResponse;
    } catch (error) {
      console.error("Gemma (Llama.cpp) Interaction Error:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Error details:", errorMsg);
      console.error(
        "Make sure Llama.cpp server is running at the configured address"
      );
      return `Connection error: ${errorMsg}. Is your Llama.cpp server running?`;
    }
  }

  resetConversation() {
    this.conversationHistory = [];
    this.toolsCalledThisConversation.clear();
  }
}

export const gemmaService = new GemmaService();
