import { GoogleGenAI, Chat, FunctionDeclaration, Type, Tool } from "@google/genai";
import { AccountType } from "../types";

// Tool Definitions
const verifyBiometricsTool: FunctionDeclaration = {
  name: "trigger_biometric_verification",
  description: "Triggers the system's biometric verification process (camera scan) for the user. Call this when you need to verify the user's identity before proceeding.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const collectAccountDetailsTool: FunctionDeclaration = {
  name: "collect_account_details",
  description: "Displays a structured input form to the user to collect their Name, ID, Account Type, and related details (Employment or Passport). Call this immediately after biometric verification is successful to gather account information.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const verifyNadraTool: FunctionDeclaration = {
  name: "verify_with_nadra",
  description: "Verifies the user's Identity Card number against the National Database (NADRA) to ensure validity and check for existing bank accounts. Returns verification status and existence check.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      identityCard: { type: Type.STRING, description: "The Identity Card Number to verify" }
    },
    required: ["identityCard"]
  },
};

const createAccountTool: FunctionDeclaration = {
  name: "create_account",
  description: "Finalizes the account opening. Call this ONLY after NADRA verification returns success and confirms the user does not already exist.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Full name of the user" },
      accountType: { type: Type.STRING, description: "Type of account: LOCAL or NON_LOCAL" },
      identityCard: { type: Type.STRING, description: "ID Card Number" },
      employer: { type: Type.STRING, description: "Employer name (if Local)" },
      salary: { type: Type.STRING, description: "Salary range (if Local)" },
      passportUploaded: { type: Type.BOOLEAN, description: "True if passport was uploaded (for Non-Local)" }
    },
    required: ["name", "accountType", "identityCard"]
  },
};

const processTransactionTool: FunctionDeclaration = {
  name: "process_transaction",
  description: "Processes a mock transaction (deposit, transfer, payment). Call this when the user wants to move money.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: { type: Type.STRING, description: "DEBIT or CREDIT" },
      amount: { type: Type.NUMBER, description: "Amount to transact" },
      description: { type: Type.STRING, description: "Description of transaction" },
    },
    required: ["type", "amount", "description"]
  },
};

const tools: Tool[] = [{
  functionDeclarations: [
    verifyBiometricsTool,
    collectAccountDetailsTool,
    verifyNadraTool,
    createAccountTool,
    processTransactionTool
  ]
}];

const SYSTEM_INSTRUCTION = `
You are "Vault", an advanced AI Banking Agent. 
Your persona is professional, efficient, and secure.
You are capable of opening bank accounts and handling transactions.

**Account Opening Process:**
1. Introduce yourself and ask how you can help.
2. If the user wants to open an account, you MUST first verify their identity using biometrics. Call the tool \`trigger_biometric_verification\`. Do not proceed until you receive a success response from this tool.
3. Once verified, do NOT ask for details one by one. Instead, call the tool \`collect_account_details\` to show the application form to the user.
4. Wait for the user to submit the form. The system will provide you with the details they entered.
5. **CRITICAL STEP**: Upon receiving the details, you MUST call \`verify_with_nadra\` using the provided Identity Card number. This checks if the user exists in the national system and if they already have an account.
6. Analyze the result from NADRA:
   - If \`verified: false\`, inform the user that identity verification failed.
   - If \`exists: true\`, inform the user they already have an account and ask if they want to log in.
   - If \`verified: true\` and \`exists: false\`, proceed to call \`create_account\` to finalize the process.

**Transaction Process (Only if account exists):**
1. If the user wants to transfer money or check balance (simulated), verify what they want to do.
2. Call \`process_transaction\` for money movements.

**General Rules:**
- Be concise.
- Keep a helpful tone.
- If biometrics fail, ask them to try again.
- Always prefer using the \`collect_account_details\` form for data entry rather than asking multiple questions in chat.
`;

export class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;
  private apiKey: string;

  constructor() {
    // Ensure API Key is available
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing from environment variables");
      // Fallback or error handling handled in UI
    }
    this.apiKey = apiKey || '';
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
  }

  startChat() {
    this.chat = this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: tools,
      }
    });
    return this.chat;
  }

  async sendMessage(
    message: string, 
    onToolCall: (name: string, args: any) => Promise<any>
  ): Promise<string> {
    if (!this.chat) {
      this.startChat();
    }

    try {
      if (!this.chat) throw new Error("Chat not initialized");

      let response = await this.chat.sendMessage({ message });
      let text = response.text || '';

      // Handle Function Calls loop (Gemini might call multiple tools or need feedback)
      // The SDK usually handles the turn logic, but we need to intercept for UI actions
      
      // Check for tool calls in the response
      let functionCalls = response.functionCalls;

      while (functionCalls && functionCalls.length > 0) {
        const functionResponses = [];
        
        for (const call of functionCalls) {
          console.log(`[GeminiService] Tool Call: ${call.name}`, call.args);
          
          // Execute client-side logic via callback
          const result = await onToolCall(call.name, call.args);
          
          functionResponses.push({
            id: call.id,
            name: call.name,
            response: { result: result } // Standardize response format
          });
        }

        const toolResponseParts = functionResponses.map(fr => ({
            functionResponse: {
                name: fr.name,
                response: fr.response,
                id: fr.id
            }
        }));

        // Send the tool output back to Gemini
        response = await this.chat.sendMessage({ message: toolResponseParts });
        
        // Update loop variables
        text = response.text || '';
        functionCalls = response.functionCalls;
      }

      return text;

    } catch (error) {
      console.error("Gemini Interaction Error:", error);
      return "I'm having trouble connecting to the banking system. Please try again.";
    }
  }
}

export const geminiService = new GeminiService();