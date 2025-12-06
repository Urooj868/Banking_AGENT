import React from "react";
import { UserAccount, Transaction } from "../types";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
} from "recharts";

interface DashboardProps {
  account: UserAccount;
  transactions: Transaction[];
  onAction: (action: string) => void;
}

const COLORS = ["#0ea5e9", "#0f172a", "#64748b"];
const DATA = [
  { name: "Savings", value: 400 },
  { name: "Investments", value: 300 },
  { name: "Expenses", value: 300 },
];

const ACTIVITY_DATA = [
  { day: "Mon", amount: 1200 },
  { day: "Tue", amount: 2100 },
  { day: "Wed", amount: 800 },
  { day: "Thu", amount: 1600 },
  { day: "Fri", amount: 2400 },
  { day: "Sat", amount: 1000 },
  { day: "Sun", amount: 3000 },
];

export const Dashboard: React.FC<DashboardProps> = ({
  account,
  transactions,
  onAction,
}) => {
  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-6 p-6 overflow-y-auto">
      {/* Left Column: Account Info */}
      <div className="flex-1 space-y-6">
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm">Total Balance</p>
              <h1 className="text-4xl font-bold text-white mt-1">
                ${account.balance.toLocaleString()}
              </h1>
            </div>
            <div className="bg-bank-900 text-bank-500 px-3 py-1 rounded-full text-xs font-mono">
              {account.accountNumber}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <span className="px-3 py-1 rounded-md bg-gray-700 text-xs text-gray-300">
              {account.type}
            </span>
            <span className="px-3 py-1 rounded-md bg-green-900 text-green-400 text-xs">
              Active
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onAction("transfer")}
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-full bg-bank-900 group-hover:bg-bank-600 flex items-center justify-center transition">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-300">Transfer</span>
          </button>

          <button
            onClick={() => onAction("bill")}
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-full bg-bank-900 group-hover:bg-bank-600 flex items-center justify-center transition">
              <svg
                className="w-5 h-5 text-white"
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
            </div>
            <span className="text-sm font-medium text-gray-300">Pay Bills</span>
          </button>
        </div>

        {/* Transactions List */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">
              Recent Transactions
            </h3>
          </div>
          <div className="divide-y divide-gray-700 max-h-[300px] overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No transactions yet.
              </div>
            ) : (
              transactions
                .slice()
                .reverse()
                .map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 flex justify-between items-center hover:bg-gray-750 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.type === "DEBIT"
                            ? "bg-red-900/50 text-red-400"
                            : "bg-green-900/50 text-green-400"
                        }`}
                      >
                        {tx.type === "DEBIT" ? "↓" : "↑"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {tx.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {tx.date.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        tx.type === "DEBIT" ? "text-white" : "text-green-400"
                      }`}
                    >
                      {tx.type === "DEBIT" ? "-" : "+"}${tx.amount}
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Visuals */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg h-64">
          <h3 className="text-sm font-medium text-gray-400 mb-4">
            Weekly Cash Flow
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ACTIVITY_DATA}>
              <XAxis
                dataKey="day"
                stroke="#475569"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#0ea5e9"
                strokeWidth={3}
                dot={{ r: 4, fill: "#0ea5e9" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg flex-1 min-h-[250px] relative">
          <h3 className="text-sm font-medium text-gray-400 absolute top-6 left-6 z-10">
            Asset Allocation
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={DATA}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {DATA.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <span className="text-xs text-gray-400">Total</span>
              <p className="text-xl font-bold text-white">100%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
