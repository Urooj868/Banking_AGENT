import React, { useState, useEffect, useRef } from "react";
import { gemmaService } from "./services/gemmaService";
import { BiometricScanner } from "./components/BiometricScanner";
import { Dashboard } from "./components/Dashboard";
import {
  Message,
  MessageRole,
  AppState,
  UserAccount,
  AccountType,
  Transaction,
  MessageContentType,
} from "./types";

// --- Components ---

interface AccountFormProps {
  onSubmit: (data: any) => void;
}

const AccountForm: React.FC<AccountFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    identityCard: "",
    accountType: "LOCAL",
    employer: "",
    salary: "",
  });
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate processing
    setTimeout(() => {
      onSubmit({
        ...formData,
        passportFileName: passportFile ? passportFile.name : null,
      });
    }, 1000);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-xl mt-2 animate-fade-in-up w-full max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-4 text-bank-500">
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="font-semibold">New Account Application</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Full Name</label>
          <input
            required
            type="text"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-bank-500 focus:outline-none text-sm"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. John Doe"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">
            Identity Card Number
          </label>
          <input
            required
            type="text"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-bank-500 focus:outline-none text-sm"
            value={formData.identityCard}
            onChange={(e) =>
              setFormData({ ...formData, identityCard: e.target.value })
            }
            placeholder="e.g. 123-456-789"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, accountType: "LOCAL" })}
              className={`px-3 py-2 rounded-lg text-sm border transition ${
                formData.accountType === "LOCAL"
                  ? "bg-bank-900 border-bank-500 text-bank-100"
                  : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"
              }`}
            >
              Local Resident
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, accountType: "NON_LOCAL" })
              }
              className={`px-3 py-2 rounded-lg text-sm border transition ${
                formData.accountType === "NON_LOCAL"
                  ? "bg-bank-900 border-bank-500 text-bank-100"
                  : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"
              }`}
            >
              Non-Local / Expat
            </button>
          </div>
        </div>

        {formData.accountType === "LOCAL" ? (
          <div className="space-y-4 animate-fade-in-up">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Employer Name
              </label>
              <input
                required
                type="text"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-bank-500 focus:outline-none text-sm"
                value={formData.employer}
                onChange={(e) =>
                  setFormData({ ...formData, employer: e.target.value })
                }
                placeholder="Current Employer"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Monthly Salary Range
              </label>
              <select
                required
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-bank-500 focus:outline-none text-sm"
                value={formData.salary}
                onChange={(e) =>
                  setFormData({ ...formData, salary: e.target.value })
                }
              >
                <option value="">Select Range</option>
                <option value="0-2000">$0 - $2,000</option>
                <option value="2000-5000">$2,000 - $5,000</option>
                <option value="5000+">$5,000+</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <label className="block text-xs text-gray-400 mb-1">
              Passport Copy (Upload)
            </label>
            <div className="relative border-2 border-dashed border-gray-700 rounded-lg p-4 hover:border-bank-500 transition group cursor-pointer bg-gray-900">
              <input
                type="file"
                required
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => setPassportFile(e.target.files?.[0] || null)}
              />
              <div className="flex flex-col items-center justify-center text-center">
                {passportFile ? (
                  <>
                    <svg
                      className="w-8 h-8 text-green-500 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm text-green-400 font-medium">
                      {passportFile.name}
                    </span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-8 h-8 text-gray-500 group-hover:text-bank-500 mb-2 transition"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span className="text-sm text-gray-400">
                      Click to upload Passport
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-bank-600 to-bank-500 hover:from-bank-500 hover:to-bank-400 text-white font-semibold py-2 rounded-lg transition shadow-lg shadow-bank-900/50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            "Submit Application"
          )}
        </button>
      </form>
    </div>
  );
};

// --- Main App ---

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Chat
  useEffect(() => {
    const welcomeId = Date.now().toString();
    setMessages([
      {
        id: welcomeId,
        role: MessageRole.MODEL,
        text: "Hello. I am Vault, your digital banking agent. I can help you open a new secure account or verify your identity for transactions.",
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleToolCall = async (name: string, args: any): Promise<any> => {
    console.log("APP: Tool Triggered:", name, args);

    if (name === "trigger_biometric_verification") {
      return new Promise((resolve) => {
        setAppState(AppState.BIOMETRIC_SCAN);
        (window as any).pendingBiometricResolve = resolve;
      });
    }

    if (name === "collect_account_details") {
      // Instead of asking, we show the form.
      // We add a message to the chat that renders the form.
      addMessage(
        MessageRole.MODEL,
        "Please fill out the account details below:",
        MessageContentType.ACCOUNT_FORM
      );
      return "Form displayed to user.";
    }

    if (name === "verify_with_nadra") {
      addMessage(
        MessageRole.SYSTEM,
        "Initiating secure connection to NADRA System..."
      );
      return new Promise((resolve) => {
        setTimeout(() => {
          const id = args.identityCard;
          // Mock Logic for NADRA
          // Simulating a check. For demo purposes, "0000" ID fails, "1111" exists, others pass.
          if (id.includes("0000")) {
            addMessage(
              MessageRole.SYSTEM,
              "NADRA Verification Failed: Invalid Identity Card."
            );
            resolve({ verified: false, error: "Invalid ID Number" });
          } else if (id.includes("1111")) {
            addMessage(
              MessageRole.SYSTEM,
              "NADRA Record Found: User already has an active account."
            );
            resolve({ verified: true, exists: true });
          } else {
            addMessage(
              MessageRole.SYSTEM,
              "NADRA Verification Successful: Citizen Validated."
            );
            resolve({
              verified: true,
              exists: false,
              citizenName: "Validated User",
            });
          }
        }, 2000); // 2 second delay for realism
      });
    }

    if (name === "create_account") {
      const newAccount: UserAccount = {
        accountNumber: Math.floor(
          1000000000 + Math.random() * 9000000000
        ).toString(),
        name: args.name,
        type:
          args.accountType === "LOCAL"
            ? AccountType.LOCAL
            : AccountType.NON_LOCAL,
        identityCard: args.identityCard,
        balance: 0,
        isVerified: true,
        employer: args.employer,
        salary: args.salary,
        passportFile: args.passportUploaded ? "passport_doc.pdf" : undefined,
      };
      setUserAccount(newAccount);
      setAppState(AppState.DASHBOARD);
      return {
        success: true,
        accountNumber: newAccount.accountNumber,
        status: "Active",
      };
    }

    if (name === "process_transaction") {
      if (!userAccount) return { error: "No account found" };

      const amount = Number(args.amount);
      const type = args.type === "DEBIT" ? "DEBIT" : "CREDIT";

      if (type === "DEBIT" && userAccount.balance < amount) {
        return { error: "Insufficient funds" };
      }

      const newTx: Transaction = {
        id: Date.now().toString(),
        amount,
        type,
        description: args.description,
        date: new Date(),
      };

      setTransactions((prev) => [...prev, newTx]);
      setUserAccount((prev) =>
        prev
          ? {
              ...prev,
              balance:
                type === "CREDIT"
                  ? prev.balance + amount
                  : prev.balance - amount,
            }
          : null
      );

      return {
        success: true,
        newBalance:
          type === "CREDIT"
            ? userAccount.balance + amount
            : userAccount.balance - amount,
        transactionId: newTx.id,
      };
    }

    return { error: "Unknown tool" };
  };

  const handleBiometricComplete = (success: boolean) => {
    setAppState(AppState.CHATTING);
    const resolve = (window as any).pendingBiometricResolve;
    if (resolve) {
      if (success) {
        resolve({
          verified: true,
          method: "facial_recognition",
          timestamp: new Date().toISOString(),
        });
      } else {
        resolve({ verified: false, error: "User cancelled or camera failed" });
      }
      delete (window as any).pendingBiometricResolve;
    }

    if (success) {
      addMessage(MessageRole.SYSTEM, "Biometric Verification Successful");
    }
  };

  const handleFormSubmit = async (data: any) => {
    // User submitted the form. We treat this as the user "sending" the info to the AI.
    const dataString = JSON.stringify(data);
    addMessage(
      MessageRole.USER,
      `I have submitted my details: ${data.name}, ID: ${data.identityCard}, Type: ${data.accountType}`
    );

    // Send hidden full data to Gemini with instruction to verify first
    processUserMessage(
      `Here are my account details: ${dataString}. Please verify my identity with NADRA using the ID provided, and if successful, create the account.`
    );
  };

  const addMessage = (
    role: MessageRole,
    text: string,
    contentType: MessageContentType = MessageContentType.TEXT
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role,
        text,
        contentType,
        timestamp: new Date(),
      },
    ]);
  };

  const processUserMessage = async (userText: string) => {
    // Show thinking
    const loadingId = Date.now().toString() + "-loading";
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        role: MessageRole.MODEL,
        text: "",
        timestamp: new Date(),
        isThinking: true,
      },
    ]);

    try {
      const responseText = await gemmaService.sendMessage(
        userText,
        handleToolCall
      );
      setMessages((prev) => prev.filter((m) => m.id !== loadingId));
      addMessage(MessageRole.MODEL, responseText);
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== loadingId));
      addMessage(
        MessageRole.MODEL,
        "I encountered an error. Please try again."
      );
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const userText = inputText;
    setInputText("");
    setAppState(AppState.CHATTING);
    addMessage(MessageRole.USER, userText);
    await processUserMessage(userText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") sendMessage();
  };

  const handleDashboardAction = (action: string) => {
    if (action === "transfer") {
      addMessage(MessageRole.SYSTEM, "Initiating Transfer Request...");
    }
  };

  // ---------------- RENDER ----------------

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans overflow-hidden">
      {/* Biometric Overlay */}
      {appState === AppState.BIOMETRIC_SCAN && (
        <BiometricScanner onComplete={handleBiometricComplete} />
      )}

      {/* Main Container */}
      <div className="flex w-full h-full relative">
        {/* Left/Top Area: Chat Interface */}
        <div
          className={`flex flex-col transition-all duration-500 ease-in-out border-r border-gray-800 bg-gray-950 ${
            userAccount
              ? "w-full md:w-1/3 lg:w-1/4"
              : "w-full max-w-2xl mx-auto border-x"
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-800 flex items-center gap-3 bg-gray-950/80 backdrop-blur-md z-10 sticky top-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bank-500 to-bank-800 flex items-center justify-center shadow-lg shadow-bank-500/20">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-white">Vault AI</h1>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs text-gray-400">Secure Connection</span>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === MessageRole.USER ? "items-end" : "items-start"
                } animate-fade-in-up`}
              >
                <div
                  className={`max-w-[90%] p-3 rounded-2xl shadow-sm ${
                    msg.role === MessageRole.USER
                      ? "bg-bank-600 text-white rounded-br-none"
                      : msg.role === MessageRole.SYSTEM
                      ? "bg-gray-800 border border-gray-700 text-gray-300 text-sm w-full text-center"
                      : "bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700"
                  }`}
                >
                  {msg.isThinking ? (
                    <div className="flex gap-1.5 h-6 items-center px-2">
                      <span
                        className="w-2 h-2 bg-gradient-to-t from-bank-600 to-cyan-400 rounded-full animate-wave"
                        style={{ animationDelay: "0ms" }}
                      ></span>
                      <span
                        className="w-2 h-2 bg-gradient-to-t from-bank-600 to-cyan-400 rounded-full animate-wave"
                        style={{ animationDelay: "150ms" }}
                      ></span>
                      <span
                        className="w-2 h-2 bg-gradient-to-t from-bank-600 to-cyan-400 rounded-full animate-wave"
                        style={{ animationDelay: "300ms" }}
                      ></span>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {msg.text}
                    </p>
                  )}
                </div>

                {/* Render Form if Content Type matches */}
                {msg.contentType === MessageContentType.ACCOUNT_FORM && (
                  <AccountForm onSubmit={handleFormSubmit} />
                )}

                {/* Timestamp */}
                {!msg.isThinking && msg.role !== MessageRole.SYSTEM && (
                  <span className="text-[10px] text-gray-600 mt-1 px-1">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-gray-950 border-t border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-bank-500 focus:ring-1 focus:ring-bank-500 transition placeholder-gray-500"
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim()}
                className="bg-bank-600 hover:bg-bank-500 text-white rounded-xl px-4 py-3 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Area: Dashboard (Only visible when account exists) */}
        {userAccount && (
          <div className="hidden md:flex flex-1 bg-gray-900 flex-col animate-fade-in-up">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Welcome, {userAccount.name.split(" ")[0]}
                </h2>
                <p className="text-sm text-gray-400">Account Dashboard</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold border border-gray-600">
                {userAccount.name.charAt(0)}
              </div>
            </div>
            <Dashboard
              account={userAccount}
              transactions={transactions}
              onAction={handleDashboardAction}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
