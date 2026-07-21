"use client";

import React, { useState } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import {
  Terminal,
  Play,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  SlidersHorizontal,
  Clock,
  HardDrive,
  Plus,
  Trash2,
  HelpCircle
} from "lucide-react";

export default function ExecutionTerminal() {
  const {
    currentProblem,
    runResult,
    submissionResult,
    terminalTab,
    setTerminalTab,
    customTestInput,
    setCustomTestInput,
    runCode,
    submitCode,
    theme
  } = useWorkspace();

  const isDark = theme === "dark";
  const isExecuting = runResult.status === "Running";
  const isSubmitting = submissionResult.status === "Running";
  const isAnyRunning = isExecuting || isSubmitting;
  const activeResult = terminalTab === "submission" ? submissionResult : runResult;

  // Structured multi-case state initialized from currentProblem sample test cases
  const sampleInputs = (currentProblem?.sample_test_cases || []).map((tc) => tc.input);
  const [testCasesList, setTestCasesList] = useState<string[]>(
    sampleInputs.length > 0 ? sampleInputs : ["nums = [2,7,11,15], target = 9"]
  );
  const [activeCaseIndex, setActiveCaseIndex] = useState<number>(0);

  // Sync test cases whenever selected problem changes
  React.useEffect(() => {
    if (currentProblem && currentProblem.sample_test_cases) {
      const inputs = currentProblem.sample_test_cases.map((tc) => tc.input);
      if (inputs.length > 0) {
        setTestCasesList(inputs);
        setActiveCaseIndex(0);
        setCustomTestInput(inputs[0]);
      }
    }
  }, [currentProblem?.id]);

  const handleCaseInputChange = (val: string) => {
    const updated = [...testCasesList];
    updated[activeCaseIndex] = val;
    setTestCasesList(updated);
    setCustomTestInput(val);
  };

  const handleAddTestCase = () => {
    const defaultInput = currentProblem?.sample_test_cases[0]?.input || "nums = [1,2,3], target = 5";
    const newCase = testCasesList[activeCaseIndex] || defaultInput;
    const updated = [...testCasesList, newCase];
    setTestCasesList(updated);
    setActiveCaseIndex(updated.length - 1);
    setCustomTestInput(newCase);
  };

  const handleDeleteTestCase = (idx: number) => {
    if (testCasesList.length <= 1) return;
    const updated = testCasesList.filter((_, i) => i !== idx);
    setTestCasesList(updated);
    const newIdx = Math.max(0, activeCaseIndex - 1);
    setActiveCaseIndex(newIdx);
    setCustomTestInput(updated[newIdx]);
  };

  const renderStatusBadge = (res = activeResult) => {
    switch (res.status) {
      case "Accepted":
      case "Success":
        return (
          <span
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold border ${
              isDark
                ? "text-green-400 bg-green-950/80 border-green-700/80"
                : "text-green-800 bg-green-100 border-green-300"
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{res.status}</span>
          </span>
        );
      case "Failed":
      case "Wrong Answer":
        return (
          <span
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold border ${
              isDark
                ? "text-red-400 bg-red-950/80 border-red-700/80"
                : "text-red-800 bg-red-100 border-red-300"
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>{res.status}</span>
          </span>
        );
      case "Compile Error":
      case "Runtime Error":
        return (
          <span
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold border ${
              isDark
                ? "text-yellow-400 bg-yellow-950/80 border-yellow-700/80"
                : "text-amber-800 bg-amber-100 border-amber-300"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{res.status}</span>
          </span>
        );
      default:
        return (
          <span className="text-slate-400 text-[11px] font-mono">
            {res.status}
          </span>
        );
    }
  };

  // Active result test case tab index
  const [activeResultCaseIndex, setActiveResultCaseIndex] = useState<number>(0);

  return (
    <div
      className={`h-full flex flex-col overflow-hidden border-b select-none transition-colors ${
        isDark ? "bg-[#0B0F19] text-slate-200 border-[#1F2937]" : "bg-white text-slate-900 border-slate-200"
      }`}
    >
      {/* Console Tab Bar */}
      <div
        className={`h-10 border-b px-3 flex items-center justify-between transition-colors ${
          isDark ? "bg-[#111827] border-[#1F2937]" : "bg-slate-50 border-slate-200"
        }`}
      >
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTerminalTab("testcases")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              terminalTab === "testcases"
                ? isDark
                  ? "bg-[#0B0F19] text-yellow-400 border border-[#1F2937]"
                  : "bg-white text-amber-700 border border-slate-200 shadow-2xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Custom Input</span>
          </button>

          <button
            onClick={() => setTerminalTab("results")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              terminalTab === "results"
                ? isDark
                  ? "bg-[#0B0F19] text-yellow-400 border border-[#1F2937]"
                  : "bg-white text-amber-700 border border-slate-200 shadow-2xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Run Testcases</span>
          </button>

          <button
            onClick={() => setTerminalTab("submission")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              terminalTab === "submission"
                ? isDark
                  ? "bg-[#0B0F19] text-green-400 border border-[#1F2937]"
                  : "bg-white text-green-700 border border-slate-200 shadow-2xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Submission</span>
          </button>
        </div>

        <div>{renderStatusBadge()}</div>
      </div>

      {/* Console Content View (Scrollable) */}
      <div className={`flex-1 p-3.5 overflow-auto font-mono text-xs select-text ${isDark ? "bg-[#0B0F19]" : "bg-white"}`}>
        {/* --- TAB 1: STRUCTURED CUSTOM TEST CASES --- */}
        {terminalTab === "testcases" && (
          <div className="space-y-3">
            {/* Case Selector Tabs & Add Button */}
            <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-[#1F2937]">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {testCasesList.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveCaseIndex(idx);
                      setCustomTestInput(testCasesList[idx]);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      activeCaseIndex === idx
                        ? isDark
                          ? "bg-[#111827] text-amber-400 border border-amber-600/50"
                          : "bg-amber-50 text-amber-900 border border-amber-300"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <span>Case {idx + 1}</span>
                  </button>
                ))}

                <button
                  onClick={handleAddTestCase}
                  className={`p-1 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    isDark
                      ? "hover:bg-[#111827] text-amber-400"
                      : "hover:bg-slate-100 text-amber-700"
                  }`}
                  title="Add new custom test case"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {testCasesList.length > 1 && (
                <button
                  onClick={() => handleDeleteTestCase(activeCaseIndex)}
                  className="text-xs text-red-500 hover:text-red-700 p-1 flex items-center gap-1 cursor-pointer"
                  title="Delete active test case"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Input Format Helper */}
            <div className={`p-2 rounded border text-[11px] flex items-center gap-1.5 ${isDark ? "bg-[#111827] border-[#1F2937] text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"}`}>
              <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Input Format: <code>key = value</code> comma-separated list (e.g. <code>{currentProblem?.sample_test_cases[0]?.input || "nums = [2,7,11,15], target = 9"}</code>)</span>
            </div>

            {/* Custom Input Text Area */}
            <textarea
              value={testCasesList[activeCaseIndex] || customTestInput}
              onChange={(e) => handleCaseInputChange(e.target.value)}
              placeholder={currentProblem?.sample_test_cases[0]?.input || "nums = [2,7,11,15], target = 9"}
              className={`w-full h-24 border rounded-lg p-3 placeholder-slate-400 outline-none focus:border-amber-500 resize-none font-mono ${
                isDark
                  ? "bg-[#111827] border-[#1F2937] text-white"
                  : "bg-slate-50 border-slate-200 text-slate-900"
              }`}
            />
          </div>
        )}

        {/* --- TAB 2: RUN TESTCASES (LeetCode Style Multi-Case Results) --- */}
        {terminalTab === "results" && (
          <div className="space-y-3">
            {runResult.status === "Running" && (
              <div className="flex items-center gap-2 text-amber-500 animate-pulse font-bold p-2">
                <Play className="w-4 h-4 animate-spin" />
                <span>Executing test cases...</span>
              </div>
            )}

            {runResult.status !== "Running" && runResult.status !== "Idle" && (
              <>
                {/* Result Header Bar */}
                <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-[#1F2937]">
                  <div className="flex items-center gap-2">
                    {renderStatusBadge(runResult)}
                    <span className="font-bold opacity-80 text-xs">{runResult.message}</span>
                  </div>
                  {runResult.runtime && (
                    <div className="flex items-center gap-3 text-[11px] opacity-80 font-mono">
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded border ${isDark ? "bg-[#111827] border-[#1F2937]" : "bg-slate-50 border-slate-200"}`}>
                        <Clock className="w-3 h-3 text-amber-500" />
                        {runResult.runtime}
                      </span>
                    </div>
                  )}
                </div>

                {/* Case Selector Tabs for Results */}
                {runResult.results && runResult.results.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 overflow-x-auto border-b pb-2 border-slate-200 dark:border-[#1F2937]">
                      {runResult.results.map((c, idx) => {
                        const isPassed = c.status === "Passed" || c.status === "Executed";
                        const isSelected = activeResultCaseIndex === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => setActiveResultCaseIndex(idx)}
                            className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? isDark
                                  ? "bg-[#111827] text-white border border-amber-500/60 shadow-xs"
                                  : "bg-amber-50 text-slate-900 border border-amber-400 shadow-2xs"
                                : isDark
                                ? "text-slate-400 hover:text-slate-200 hover:bg-[#111827]"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isPassed ? "bg-emerald-400" : "bg-red-500"}`} />
                            <span>Case {idx + 1}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Test Case Detail Display */}
                    {(() => {
                      const curCase = runResult.results[activeResultCaseIndex] || runResult.results[0];
                      if (!curCase) return null;

                      const isPassed = curCase.status === "Passed" || curCase.status === "Executed";
                      return (
                        <div className="space-y-3">
                          {/* Input Section */}
                          <div className="space-y-1">
                            <span className="opacity-70 font-bold uppercase text-[10px] block">Input</span>
                            <div className={`p-2.5 rounded-lg border font-mono text-xs whitespace-pre-wrap ${
                              isDark ? "bg-[#111827] border-[#1F2937] text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                            }`}>
                              {curCase.input}
                            </div>
                          </div>

                          {/* Output (Actual Return Value) */}
                          <div className="space-y-1">
                            <span className="opacity-70 font-bold uppercase text-[10px] block">Output (Return Value)</span>
                            <div className={`p-2.5 rounded-lg border font-mono text-xs whitespace-pre-wrap ${
                              isPassed
                                ? isDark ? "bg-[#111827] border-green-900/50 text-green-400" : "bg-green-50 border-green-200 text-green-800"
                                : isDark ? "bg-[#111827] border-red-900/50 text-red-400" : "bg-red-50 border-red-200 text-red-800"
                            }`}>
                              {curCase.actual || (curCase.error ? "(Error)" : "(No Output)")}
                            </div>
                          </div>

                          {/* Expected Output */}
                          <div className="space-y-1">
                            <span className="opacity-70 font-bold uppercase text-[10px] block">Expected</span>
                            <div className={`p-2.5 rounded-lg border font-mono text-xs whitespace-pre-wrap ${
                              isDark ? "bg-[#111827] border-[#1F2937] text-green-400" : "bg-slate-50 border-slate-200 text-green-700"
                            }`}>
                              {curCase.expected || "N/A (Custom Test Case)"}
                            </div>
                          </div>

                          {/* Stdout / Debug Print Logs */}
                          {curCase.stdout && (
                            <div className="space-y-1">
                              <span className="text-amber-500 font-bold uppercase text-[10px] block">Stdout (Print Logs for Debugging)</span>
                              <div className={`p-2.5 rounded-lg border font-mono text-xs whitespace-pre-wrap text-amber-400 ${
                                isDark ? "bg-[#111827] border-amber-900/50" : "bg-amber-50/50 border-amber-200"
                              }`}>
                                {curCase.stdout}
                              </div>
                            </div>
                          )}

                          {/* Error Output */}
                          {curCase.error && (
                            <div className="space-y-1">
                              <span className="text-red-500 font-bold uppercase text-[10px] block">Error Log</span>
                              <div className={`p-2.5 rounded-lg border font-mono text-xs whitespace-pre-wrap text-red-400 ${
                                isDark ? "bg-[#111827] border-red-900/50" : "bg-red-50 border-red-200"
                              }`}>
                                {curCase.error}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  /* Fallback display for legacy/error outputs */
                  <div className="space-y-2">
                    {runResult.input && (
                      <div className="space-y-1">
                        <span className="opacity-70 font-bold uppercase text-[10px] block">Input</span>
                        <div className={`p-2.5 rounded-lg border font-mono text-xs ${isDark ? "bg-[#111827] border-[#1F2937]" : "bg-slate-50 border-slate-200"}`}>
                          {runResult.input}
                        </div>
                      </div>
                    )}
                    {runResult.actual && (
                      <div className="space-y-1">
                        <span className="text-red-500 font-bold uppercase text-[10px] block">Output</span>
                        <div className={`p-2.5 rounded-lg border font-mono text-xs text-red-400 ${isDark ? "bg-[#111827] border-red-900/50" : "bg-red-50 border-red-200"}`}>
                          {runResult.actual}
                        </div>
                      </div>
                    )}
                    {runResult.expected && (
                      <div className="space-y-1">
                        <span className="text-green-500 font-bold uppercase text-[10px] block">Expected</span>
                        <div className={`p-2.5 rounded-lg border font-mono text-xs text-green-400 ${isDark ? "bg-[#111827] border-[#1F2937]" : "bg-slate-50 border-slate-200"}`}>
                          {runResult.expected}
                        </div>
                      </div>
                    )}
                    {runResult.stdout && (
                      <div className="space-y-1">
                        <span className="text-amber-500 font-bold uppercase text-[10px] block">Stdout</span>
                        <div className={`p-2.5 rounded-lg border font-mono text-xs text-amber-400 ${isDark ? "bg-[#111827] border-amber-900/50" : "bg-amber-50 border-amber-200"}`}>
                          {runResult.stdout}
                        </div>
                      </div>
                    )}
                    {runResult.error && (
                      <div className="space-y-1">
                        <span className="text-red-500 font-bold uppercase text-[10px] block">Error Log</span>
                        <div className={`p-2.5 rounded-lg border font-mono text-xs text-red-400 ${isDark ? "bg-[#111827] border-red-900/50" : "bg-red-50 border-red-200"}`}>
                          {runResult.error}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* --- TAB 3: SUBMISSION DETAILS (ONLY DISPLAYED ON SUBMIT) --- */}
        {terminalTab === "submission" && (
          <div className="space-y-3">
            <div className={`p-3.5 border rounded-lg space-y-2 ${isDark ? "bg-[#111827] border-[#1F2937]" : "bg-slate-50 border-slate-200"}`}>
              <div className="text-sm font-bold flex items-center justify-between">
                <span>Submission Summary</span>
                {renderStatusBadge(submissionResult)}
              </div>
              <p className="leading-relaxed">{submissionResult.message}</p>
              {submissionResult.total_passed !== undefined && (
                <div className="text-xs opacity-80">
                  Passed <span className="text-green-500 font-bold">{submissionResult.total_passed}</span> /{" "}
                  <span className="font-bold">{submissionResult.total_cases || 5}</span> hidden test cases.
                </div>
              )}
            </div>

            {submissionResult.failed_case && (
              <div className={`p-3 rounded-lg border space-y-2 text-xs ${isDark ? "bg-[#111827] border-red-900/50" : "bg-red-50 border-red-200"}`}>
                <div className="text-red-500 font-bold">Failed on Hidden Test Case #{submissionResult.failed_case}</div>
                {submissionResult.input && (
                  <div>
                    <span className="font-bold opacity-70 block mb-1">Input:</span>
                    <div className={`p-2 rounded font-mono ${isDark ? "bg-black/40 text-white" : "bg-white text-slate-900"}`}>{submissionResult.input}</div>
                  </div>
                )}
                {submissionResult.actual !== undefined && (
                  <div>
                    <span className="font-bold text-red-500 block mb-1">Actual Output:</span>
                    <div className={`p-2 rounded font-mono text-red-400 ${isDark ? "bg-black/40" : "bg-white"}`}>{submissionResult.actual || "(No Output)"}</div>
                  </div>
                )}
                {submissionResult.expected && (
                  <div>
                    <span className="font-bold text-green-500 block mb-1">Expected Output:</span>
                    <div className={`p-2 rounded font-mono text-green-400 ${isDark ? "bg-black/40" : "bg-white"}`}>{submissionResult.expected}</div>
                  </div>
                )}
                {submissionResult.stdout && (
                  <div>
                    <span className="font-bold text-amber-500 block mb-1">Stdout (Print Logs):</span>
                    <div className={`p-2 rounded font-mono text-amber-400 whitespace-pre-wrap ${isDark ? "bg-black/40" : "bg-white"}`}>{submissionResult.stdout}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Console Bottom Action Bar: Run & Submit Code */}
      <div className={`h-12 border-t px-4 flex items-center justify-end gap-3 transition-colors ${isDark ? "bg-[#111827] border-[#1F2937]" : "bg-slate-50 border-slate-200"}`}>
        {/* Run Code Button (Orange Accent) */}
        <button
          onClick={() => runCode(testCasesList)}
          disabled={isAnyRunning}
          className={`px-4 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs border ${
            isDark
              ? "bg-[#1F2937] hover:bg-slate-700 text-orange-300 border-orange-800/40"
              : "bg-white hover:bg-slate-100 text-orange-900 border-orange-300"
          }`}
        >
          <Play className="w-3.5 h-3.5 text-orange-500" />
          <span>{isExecuting ? "Running..." : "Run Code"}</span>
        </button>

        {/* Submit Code Button (Standard Green) */}
        <button
          onClick={submitCode}
          disabled={isAnyRunning}
          className="px-5 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <Send className="w-3.5 h-3.5 text-white" />
          <span>{isSubmitting ? "Submitting..." : "Submit Code"}</span>
        </button>
      </div>
    </div>
  );
}
