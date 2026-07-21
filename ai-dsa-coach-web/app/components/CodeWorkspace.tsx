"use client";

import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { useWorkspace } from "../context/WorkspaceContext";
import { RotateCcw, Code2, Type, AlertTriangle, X, Clock, Play, Pause } from "lucide-react";

export default function CodeWorkspace() {
  const {
    language,
    setLanguage,
    code,
    setCode,
    resetCode,
    currentProblem,
    theme,
    timerSeconds,
    isTimerRunning,
    toggleTimer,
    resetTimer,
    loading
  } = useWorkspace();

  const [fontSize, setFontSize] = useState<number>(14);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  const supportedLanguages = currentProblem?.supported_languages || [
    "python",
    "cpp",
    "java"
  ];

  const isDark = theme === "dark";

  if (loading) {
    return (
      <div className={`h-full w-full flex flex-col items-center justify-center transition-colors ${
        isDark ? "bg-[#0B0F19] text-slate-400" : "bg-white text-slate-500"
      }`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
          <span className="text-xs font-medium animate-pulse">Initializing Workspace...</span>
        </div>
      </div>
    );
  }

  const handleConfirmReset = () => {
    resetCode();
    setShowResetModal(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getTimerColorClass = (secs: number) => {
    if (secs <= 60) return "text-red-500 font-extrabold animate-pulse";
    if (secs <= 300) return "text-orange-400 font-bold animate-pulse";
    return isDark ? "text-slate-200 font-bold" : "text-slate-800 font-bold";
  };

  return (
    <div
      className={`h-full flex flex-col overflow-hidden select-none border-b transition-colors ${
        isDark ? "bg-[#111827] border-[#1F2937]" : "bg-white border-slate-200"
      }`}
    >
      {/* Editor Header Toolbar at absolute top of Column 2 */}
      <div
        className={`h-10 border-b flex items-center justify-between px-4 transition-colors ${
          isDark ? "bg-[#0B0F19] border-[#1F2937] text-white" : "bg-slate-50 border-slate-200 text-slate-900"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <Code2 className="w-4 h-4 text-amber-500" />
            <span>Code Workspace</span>
          </div>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className={`text-xs font-semibold py-1 px-3 rounded border outline-none focus:border-amber-500 cursor-pointer transition-colors ${
              isDark
                ? "bg-[#111827] text-white border-[#1F2937]"
                : "bg-white text-slate-800 border-slate-300"
            }`}
          >
            {supportedLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang === "cpp" ? "C++" : lang === "python" ? "Python 3" : lang === "java" ? "Java" : lang.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Countdown Timer Component */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border bg-black/10 dark:bg-white/5 border-slate-300 dark:border-slate-800 shadow-xs">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span className={`text-xs font-mono tracking-wider ${getTimerColorClass(timerSeconds)}`}>
            {formatTime(timerSeconds)}
          </span>
          <div className="flex items-center gap-1 pl-1 border-l border-slate-300 dark:border-slate-700">
            <button
              onClick={toggleTimer}
              title={isTimerRunning ? "Pause Timer" : "Start Timer"}
              className="p-1 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer rounded"
            >
              {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            <button
              onClick={resetTimer}
              title="Reset Timer"
              className="p-1 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer rounded"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Font Size Adjuster */}
          <div className="flex items-center gap-1">
            <Type className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className={`text-xs font-medium py-0.5 px-2 rounded border outline-none cursor-pointer ${
                isDark
                  ? "bg-[#111827] text-white border-[#1F2937]"
                  : "bg-white text-slate-800 border-slate-300"
              }`}
            >
              <option value={12}>12px</option>
              <option value={14}>14px</option>
              <option value={16}>16px</option>
              <option value={18}>18px</option>
            </select>
          </div>

          {/* Reset Code Button */}
          <button
            onClick={() => setShowResetModal(true)}
            className={`p-1.5 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors cursor-pointer`}
            title="Reset to Starter Template"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Monaco Code Editor Area */}
      <div className="flex-1 w-full h-0 relative">
        <Editor
          height="100%"
          language={language === "cpp" ? "cpp" : language === "python" ? "python" : language}
          theme={isDark ? "vs-dark" : "light"}
          value={code}
          onChange={(val) => setCode(val || "")}
          options={{
            fontSize: fontSize,
            fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            lineNumbersMinChars: 3,
            padding: { top: 12, bottom: 12 },
            tabSize: 4,
            scrollbar: {
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10
            }
          }}
        />
      </div>

      {/* Confirmation Modal for Resetting Code */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            className={`max-w-md w-full rounded-xl p-5 border shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150 ${
              isDark ? "bg-[#111827] border-[#1F2937] text-white" : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Reset Code Template?</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    This will erase all your current code changes for this problem.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowResetModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  isDark
                    ? "bg-[#0B0F19] hover:bg-[#1F2937] border-[#1F2937] text-slate-300"
                    : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer shadow-xs"
              >
                Yes, Reset Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
