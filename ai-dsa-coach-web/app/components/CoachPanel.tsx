"use client";

import React, { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useWorkspace } from "../context/WorkspaceContext";
import {
  Bot,
  User,
  Send,
  Trash2,
  Sparkles,
  Code2,
  Lightbulb,
  Copy,
  Check
} from "lucide-react";

export default function CoachPanel() {
  const {
    chatHistory,
    inputMessage,
    setInputMessage,
    sendCoachMessage,
    isCoaching,
    clearChat,
    currentProblem,
    theme
  } = useWorkspace();

  const isDark = theme === "dark";
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isCoaching]);

  const handleCopyCode = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={`h-full flex flex-col overflow-hidden select-none transition-colors ${isDark ? "bg-[#0B0F19] text-slate-200" : "bg-white text-slate-900"}`}>
      {/* Top Header: Status bar & Clear Chat */}
      <div className={`h-10 border-b px-4 flex items-center justify-between transition-colors ${isDark ? "bg-[#111827] border-[#1F2937]" : "bg-slate-50 border-slate-200"}`}>
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 status-pulse"></span>
          </div>
          <span className="text-xs font-bold">
            Socratic Coach v1.0
          </span>
          <span className={`text-[10px] px-2 py-0.2 rounded font-mono border ${isDark ? "bg-green-950/80 text-green-400 border-green-800/80" : "bg-green-100 text-green-800 border-green-300"}`}>
            ONLINE
          </span>
        </div>

        <button
          onClick={clearChat}
          title="Clear chat history"
          className={`p-1 rounded transition-colors cursor-pointer ${isDark ? "hover:bg-[#1F2937] text-slate-400 hover:text-red-400" : "hover:bg-slate-200 text-slate-500 hover:text-red-600"}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chat Timeline (Scrollable) */}
      <div className={`flex-1 p-4 overflow-y-auto space-y-4 select-text ${isDark ? "bg-[#0B0F19]" : "bg-white"}`}>
        {chatHistory.length === 0 ? (
          <div className={`text-center py-8 px-4 rounded-xl border space-y-4 ${isDark ? "bg-[#111827]/60 border-[#1F2937]" : "bg-slate-50 border-slate-200"}`}>
            <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center mx-auto shadow-md">
              <Bot className="w-6 h-6 text-slate-950" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm">
                Socratic AI DSA Coach
              </h3>
              <p className="text-xs opacity-75 max-w-xs mx-auto leading-relaxed">
                I guide you through problem-solving using Socratic questioning without spoiling direct solutions!
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() =>
                  sendCoachMessage(
                    `Hello Coach! Can you give me a subtle hint on how to start ${currentProblem?.title}?`
                  )
                }
                className={`w-full py-2 px-3 border rounded-lg text-xs font-medium transition-all text-left flex items-center gap-2 cursor-pointer shadow-2xs ${
                  isDark
                    ? "bg-[#111827] hover:bg-[#1F2937] border-yellow-700/50 text-yellow-300"
                    : "bg-white hover:bg-slate-100 border-amber-300 text-amber-900"
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Ask for a subtle hint</span>
              </button>
              <button
                onClick={() =>
                  sendCoachMessage(
                    `What is the optimal time and space complexity requirement for ${currentProblem?.title}?`
                  )
                }
                className={`w-full py-2 px-3 border rounded-lg text-xs font-medium transition-all text-left flex items-center gap-2 cursor-pointer shadow-2xs ${
                  isDark
                    ? "bg-[#111827] hover:bg-[#1F2937] border-orange-700/50 text-orange-300"
                    : "bg-white hover:bg-slate-100 border-orange-300 text-orange-900"
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-orange-500" />
                <span>Discuss optimal complexity targets</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chatHistory.map((msg, idx) => (
              <div
                key={msg.id || idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[92%] rounded-xl p-3.5 text-xs leading-relaxed border shadow-xs ${
                    msg.role === "user"
                      ? isDark
                        ? "bg-[#111827] border-orange-900/50 text-white"
                        : "bg-amber-50 border-amber-200 text-slate-900"
                      : isDark
                      ? "bg-[#111827] border-[#1F2937] text-white"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                >
                  {/* Header Row */}
                  <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b opacity-60 text-[10px] font-bold">
                    <div className="flex items-center gap-1.5">
                      {msg.role === "user" ? (
                        <>
                          <User className="w-3 h-3 text-orange-500" />
                          <span className="text-orange-500">Candidate</span>
                        </>
                      ) : (
                        <>
                          <Bot className="w-3 h-3 text-amber-500" />
                          <span className="text-amber-500">Socratic Coach</span>
                        </>
                      )}
                    </div>
                    <span className="font-mono">
                      {msg.timestamp || ""}
                    </span>
                  </div>

                  {/* Message Markdown Body */}
                  <div className="prose prose-xs max-w-none leading-relaxed">
                    {msg.content ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            const codeString = String(children).replace(/\n$/, "");
                            return match ? (
                              <div className={`my-2 rounded-lg border font-mono text-[11px] overflow-hidden ${isDark ? "border-[#1F2937] bg-[#0B0F19]" : "border-slate-200 bg-slate-50"}`}>
                                <div className={`px-3 py-1 border-b flex items-center justify-between text-[10px] ${isDark ? "bg-[#111827] border-[#1F2937] text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"}`}>
                                  <span>{match[1]}</span>
                                  <button
                                    onClick={() => handleCopyCode(codeString, msg.id)}
                                    className="hover:opacity-100 flex items-center gap-1"
                                  >
                                    {copiedId === msg.id ? (
                                      <Check className="w-3 h-3 text-green-500" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                    <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                                  </button>
                                </div>
                                <pre className="p-3 text-amber-500 overflow-x-auto">
                                  <code>{codeString}</code>
                                </pre>
                              </div>
                            ) : (
                              <code
                                className={`px-1 py-0.5 rounded border font-mono ${isDark ? "bg-[#111827] border-[#1F2937] text-yellow-300" : "bg-slate-100 border-slate-200 text-amber-800"}`}
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : isCoaching && idx === chatHistory.length - 1 ? (
                      <div className="flex items-center gap-2 opacity-75 animate-pulse font-mono py-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                        <span>Socratic Coach is thinking...</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Fixed Bottom Input Bar */}
      <div className={`p-3 border-t flex items-center gap-2 transition-colors ${isDark ? "bg-[#111827] border-[#1F2937]" : "bg-slate-50 border-slate-200"}`}>
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !isCoaching && inputMessage.trim()) {
              e.preventDefault();
              sendCoachMessage();
            }
          }}
          disabled={isCoaching}
          placeholder={
            isCoaching
              ? "Coach is generating response..."
              : "Ask the Socratic Coach... (Enter to send)"
          }
          className={`flex-1 border rounded-lg px-3 py-2 text-xs placeholder-slate-400 outline-none focus:border-amber-500 resize-none h-10 leading-tight transition-colors disabled:opacity-50 ${
            isDark
              ? "bg-[#0B0F19] border-[#1F2937] text-white"
              : "bg-white border-slate-200 text-slate-900"
          }`}
        />

        <button
          onClick={() => sendCoachMessage()}
          disabled={isCoaching || !inputMessage.trim()}
          className="w-10 h-10 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold rounded-lg flex items-center justify-center transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4 text-slate-950" />
        </button>
      </div>
    </div>
  );
}
