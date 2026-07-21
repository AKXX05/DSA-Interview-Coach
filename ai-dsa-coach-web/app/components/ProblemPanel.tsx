"use client";

import React, { useState, useRef, useEffect } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import {
  Folder,
  ChevronRight,
  ChevronDown,
  Clock,
  HardDrive,
  Building2,
  Tag,
  HelpCircle,
  MessageSquare,
  Lock,
  Unlock,
  Sparkles,
  Layers
} from "lucide-react";
import { formatMathText } from "../utils/formatMath";

const TOPICS_LIST = [
  "All Problems",
  "Arrays",
  "Sorting",
  "Binary Search",
  "Strings",
  "Linked List",
  "Recursion",
  "Bit Manipulation",
  "Stack",
  "Queue",
  "Sliding Window",
  "Two Pointers",
  "Heaps",
  "Greedy",
  "Binary Tree",
  "BST",
  "Graphs",
  "DP",
  "Combinatorics",
  "DFS",
  "BFS",
  "Prefix Sum",
  "Backtracking",
  "Number Theory",
  "DSU",
  "Divide & Conquer",
  "Mathematics"
];

const normalize = (s: string) => s.toLowerCase().trim();

const isTopicMatch = (problem: any, topicName: string) => {
  if (topicName === "All Problems") return true;

  const target = normalize(topicName);
  const pTopic = normalize(problem.topic || "");

  // Exact topic match — primary and only source of truth
  if (pTopic === target) return true;

  // Handle shorthand aliases only (no tags fallback — tags cause cross-topic leakage)
  const aliases: Record<string, string> = {
    "dp": "dynamic programming",
    "bst": "binary search tree",
    "dfs": "depth-first search",
    "bfs": "breadth-first search",
    "bs": "binary search",
  };
  const resolvedTarget = aliases[target] ?? target;
  if (pTopic === resolvedTarget) return true;

  return false;
};

export default function ProblemPanel() {
  const {
    problems,
    currentProblem,
    selectProblem,
    isSolved,
    solvedProblemIds = [],
    discussHintWithCoach,
    theme
  } = useWorkspace();

  const isDark = theme === "dark";

  const [isNavOpen, setIsNavOpen] = useState(true);
  const [directoryHeight, setDirectoryHeight] = useState<number>(340);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedTopic, setExpandedTopic] = useState<string | null>("Arrays");
  const [showTopicsToggle, setShowTopicsToggle] = useState(false);
  const [activeDryRunStep, setActiveDryRunStep] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      const minH = 40;
      const maxH = rect.height * 0.75;
      const newH = Math.max(minH, Math.min(maxH, offsetY));

      setDirectoryHeight(newH);
      if (newH <= 50) {
        setIsNavOpen(false);
      } else {
        setIsNavOpen(true);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const toggleNav = () => {
    if (isNavOpen) {
      setIsNavOpen(false);
    } else {
      setIsNavOpen(true);
      if (directoryHeight < 150) {
        setDirectoryHeight(340);
      }
    }
  };

  const handleTopicClick = (topic: string) => {
    const isExpanded = expandedTopic === topic;
    setExpandedTopic(isExpanded ? null : topic);
    if (!isExpanded && directoryHeight < 250) {
      setDirectoryHeight(340);
      setIsNavOpen(true);
    }
  };

  if (!currentProblem) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Loading problem details...
      </div>
    );
  }

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case "Easy":
        return isDark
          ? "bg-green-950/90 text-green-400 border-green-700/60"
          : "bg-green-100 text-green-800 border-green-300";
      case "Medium":
        return isDark
          ? "bg-yellow-950/90 text-yellow-400 border-yellow-700/60"
          : "bg-amber-100 text-amber-800 border-amber-300";
      case "Hard":
        return isDark
          ? "bg-red-950/90 text-red-400 border-red-700/60"
          : "bg-red-100 text-red-800 border-red-300";
      default:
        return isDark
          ? "bg-slate-900 text-slate-400 border-slate-800"
          : "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  // Find index of currentProblem within its topic in the sidebar list to align numberings
  const currentTopicProblems = problems.filter((p) => isTopicMatch(p, currentProblem.topic || ""));
  const currentTopicIndex = currentTopicProblems.findIndex((p) => p.id === currentProblem.id);
  const formattedCode = currentTopicIndex !== -1 ? String(currentTopicIndex + 1) : String(currentProblem.id);

  return (
    <div
      ref={containerRef}
      className={`h-full w-full flex flex-col overflow-hidden border-r select-none transition-colors ${
        isDark
          ? "bg-[#0B0F19] text-slate-200 border-[#1F2937]"
          : "bg-white text-slate-800 border-slate-200"
      }`}
    >
      {/* --- SUB-PANE 1: TOPIC DIRECTORY & AI GENERATOR HEADER --- */}
      <div
        style={{ height: isNavOpen ? `${directoryHeight}px` : "40px" }}
        className={`w-full flex flex-col overflow-hidden transition-all duration-75 shrink-0 ${
          isDark ? "bg-[#111827]" : "bg-slate-50"
        }`}
      >
        <div
          className={`w-full h-[40px] px-3 flex items-center justify-between border-b ${
            isDark ? "border-[#1F2937]" : "border-slate-200"
          }`}
        >
          <button
            onClick={toggleNav}
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              isDark ? "text-yellow-400 hover:text-yellow-300" : "text-amber-700 hover:text-amber-800"
            }`}
          >
            <Folder className="w-4 h-4 text-amber-500" />
            <span>DS & Algo Topic Directory</span>
            {isNavOpen ? (
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            )}
          </button>
        </div>

        {isNavOpen && (
          <div
            className={`p-2 space-y-1 flex-1 overflow-y-auto ${
              isDark ? "border-[#1F2937]/60" : "border-slate-200"
            }`}
          >
            {(() => {
              const easyProblems = problems.filter((p) => (p.difficulty || "").toLowerCase() === "easy");
              const mediumProblems = problems.filter((p) => (p.difficulty || "").toLowerCase() === "medium");
              const hardProblems = problems.filter((p) => (p.difficulty || "").toLowerCase() === "hard");

              const easySolved = easyProblems.filter((p) => solvedProblemIds.includes(p.id)).length;
              const mediumSolved = mediumProblems.filter((p) => solvedProblemIds.includes(p.id)).length;
              const hardSolved = hardProblems.filter((p) => solvedProblemIds.includes(p.id)).length;

              return TOPICS_LIST.map((topic) => {
                const topicProblems = problems
                  .filter((p) => isTopicMatch(p, topic))
                  .sort((a, b) => a.id - b.id);

                const isExpanded = expandedTopic === topic;
                const isAll = topic === "All Problems";

                if (isAll) {
                  return (
                    <div
                      key={topic}
                      className={`rounded-xl overflow-hidden mb-2.5 p-2.5 border shadow-xs space-y-1.5 transition-colors ${
                        isDark
                          ? "bg-[#111827] border-[#1F2937]"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      {/* Centered Total Progress Title above the three blocks */}
                      <div
                        className={`text-center text-[11px] font-bold uppercase tracking-wider ${
                          isDark ? "text-amber-400" : "text-amber-700"
                        }`}
                      >
                        Total Progress
                      </div>

                      {/* Overall Difficulty Breakdown Bar matching user image */}
                      <div
                        className={`flex items-center justify-around py-2 px-2 rounded-lg border text-[11px] transition-colors ${
                          isDark
                            ? "bg-[#0B0F19] border-[#1F2937]"
                            : "bg-white border-slate-200 shadow-2xs"
                        }`}
                      >
                        {/* Easy */}
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#00E676] shrink-0 shadow-xs shadow-emerald-500/50"></span>
                          <span className={`font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>Easy</span>
                          <span className={`font-bold ml-0.5 font-mono ${isDark ? "text-white" : "text-slate-900"}`}>{easySolved}</span>
                          <span className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>/{easyProblems.length}</span>
                        </div>

                        <div className={`h-3 w-[1px] ${isDark ? "bg-slate-700/60" : "bg-slate-300"}`}></div>

                        {/* Medium */}
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FFB300] shrink-0 shadow-xs shadow-amber-500/50"></span>
                          <span className={`font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>Medium</span>
                          <span className={`font-bold ml-0.5 font-mono ${isDark ? "text-white" : "text-slate-900"}`}>{mediumSolved}</span>
                          <span className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>/{mediumProblems.length}</span>
                        </div>

                        <div className={`h-3 w-[1px] ${isDark ? "bg-slate-700/60" : "bg-slate-300"}`}></div>

                        {/* Hard */}
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FF2D55] shrink-0 shadow-xs shadow-rose-500/50"></span>
                          <span className={`font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>Hard</span>
                          <span className={`font-bold ml-0.5 font-mono ${isDark ? "text-white" : "text-slate-900"}`}>{hardSolved}</span>
                          <span className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>/{hardProblems.length}</span>
                        </div>
                      </div>
                    </div>
                  );
                }

                const topicSolvedCount = topicProblems.filter((p) => solvedProblemIds.includes(p.id)).length;
                const topicTotalCount = topicProblems.length;
                const percent = topicTotalCount > 0 ? Math.min(100, Math.round((topicSolvedCount / topicTotalCount) * 100)) : 0;

                return (
                  <div key={topic} className="rounded-md overflow-hidden mb-1">
                    <button
                      onClick={() => handleTopicClick(topic)}
                      className={`w-full px-3 py-1.5 flex items-center justify-between text-xs font-medium transition-all rounded-md cursor-pointer ${
                        isExpanded
                          ? isDark
                            ? "bg-[#1E293B] text-amber-300 font-bold border-l-2 border-amber-400"
                            : "bg-amber-50 text-amber-900 font-bold border-l-2 border-amber-500"
                          : isDark
                          ? "text-slate-200 hover:bg-[#1F2937]"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                        <span className="truncate">{topic}</span>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        {/* Progress Line Bar */}
                        <div className="flex items-center gap-2">
                          <div className={`w-16 h-1.5 rounded-full overflow-hidden shrink-0 ${
                            isDark ? "bg-slate-800" : "bg-slate-200"
                          }`}>
                            <div
                              className="h-full bg-orange-500 transition-all duration-300 rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className={`text-[11px] font-mono font-medium ${
                            isDark ? "text-slate-400" : "text-slate-600"
                          }`}>
                            {topicSolvedCount} / {topicTotalCount}
                          </span>
                        </div>

                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="pl-6 pr-2 py-1 space-y-0.5">
                        {topicProblems.length > 0 ? (
                          topicProblems.map((p, topicIndex) => {
                            const pCode = String(topicIndex + 1);
                            const isPProblemSolved = solvedProblemIds.includes(p.id);
                            return (
                              <button
                                key={p.id}
                                onClick={() => selectProblem(p.id)}
                                className={`w-full text-left px-2.5 py-1 rounded text-xs flex items-center justify-between transition-all cursor-pointer ${
                                  currentProblem.id === p.id
                                    ? isDark
                                      ? "bg-yellow-950/60 text-yellow-300 font-bold border-l-2 border-yellow-400"
                                      : "bg-amber-50 text-amber-900 font-bold border-l-2 border-amber-500"
                                    : isDark
                                    ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                }`}
                              >
                                <span className="truncate pr-2 flex items-center gap-1.5">
                                  {isPProblemSolved && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                                  )}
                                  <span>{pCode}. {p.title}</span>
                                </span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded border shrink-0 ${getDifficultyBadge(
                                    p.difficulty
                                  )}`}
                                >
                                  {p.difficulty}
                                </span>
                              </button>
                            );
                          })
                        ) : (
                          <div className="text-[11px] opacity-60 py-1 pl-2 italic">
                            <span>No problems yet</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>

      {/* Dynamic Drag Handle Bar */}
      <div
        onMouseDown={handleMouseDown}
        className={`h-2.5 cursor-row-resize flex items-center justify-center group shrink-0 transition-colors ${
          isDragging
            ? "bg-amber-500/50"
            : isDark
            ? "bg-[#0B0F19] hover:bg-amber-500/30"
            : "bg-slate-200 hover:bg-amber-400"
        }`}
      >
        <div
          className={`h-1 w-10 rounded-full transition-colors ${
            isDragging
              ? "bg-amber-400"
              : isDark
              ? "bg-[#1F2937] group-hover:bg-amber-400"
              : "bg-slate-400 group-hover:bg-slate-900"
          }`}
        ></div>
      </div>

      {/* --- SUB-PANE 2: SCROLLABLE PROBLEM DETAILS VIEW --- */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-5 space-y-6 select-text">
          {/* Header: Problem Name, ID & Difficulty */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h2
                className={`text-xl font-bold flex items-center gap-2 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                <span className="text-amber-500 font-mono">
                  {formattedCode}.
                </span>
                <span>{currentProblem.title}</span>
              </h2>
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full border shadow-xs ${getDifficultyBadge(
                  currentProblem.difficulty
                )}`}
              >
                {currentProblem.difficulty}
              </span>
            </div>

            {/* Metadata: Time & Memory Limits */}
            <div className="flex items-center gap-4 text-xs font-mono opacity-80 pt-1">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border ${
                  isDark
                    ? "bg-[#111827] border-[#1F2937] text-slate-300"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Time Limit: {currentProblem.time_limit}s</span>
              </div>
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border ${
                  isDark
                    ? "bg-[#111827] border-[#1F2937] text-slate-300"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <HardDrive className="w-3.5 h-3.5 text-orange-500" />
                <span>Memory: {currentProblem.memory_limit}MB</span>
              </div>
            </div>
          </div>

          {/* Problem Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-60">
              Problem Statement
            </h3>
            <p
              className={`text-sm font-normal whitespace-pre-wrap leading-relaxed ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {currentProblem.description}
            </p>
          </div>

          {/* Code Constraints */}
          {currentProblem.constraints && currentProblem.constraints.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-60">
                Constraints
              </h3>
              <ul
                className={`p-3.5 rounded-lg border font-mono text-xs space-y-1.5 ${
                  isDark
                    ? "bg-[#111827] border-[#1F2937] text-slate-200"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                {currentProblem.constraints.map((c, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">•</span>
                    <span>{formatMathText(c)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Examples & Visual Dry Runs */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-60">
              Examples & Visual Dry Run
            </h3>

            {currentProblem.sample_test_cases.map((test, index) => (
              <div
                key={index}
                className={`rounded-lg border overflow-hidden ${
                  isDark ? "bg-[#111827] border-[#1F2937]" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div
                  className={`px-3.5 py-2 border-b flex items-center justify-between font-mono text-xs font-bold opacity-75 ${
                    isDark ? "bg-[#0B0F19] border-[#1F2937]" : "bg-slate-100 border-slate-200"
                  }`}
                >
                  <span>Example {index + 1}</span>
                </div>
                <div className="p-3.5 font-mono text-xs space-y-1.5">
                  <p>
                    <span className="text-amber-500 font-bold">Input:</span>{" "}
                    <span className={isDark ? "text-white" : "text-slate-900"}>
                      {test.input}
                    </span>
                  </p>
                  <p>
                    <span className="text-green-500 font-bold">Output:</span>{" "}
                    <span className={isDark ? "text-white" : "text-slate-900"}>
                      {test.expected}
                    </span>
                  </p>

                  {/* Render Example Explanation directly below Input & Output */}
                  {test.explanation && (
                    <p className="pt-2 border-t border-dashed border-slate-300 dark:border-[#1F2937]">
                      <span className="text-orange-400 font-bold">Explanation:</span>{" "}
                      <span className={`font-sans leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        {test.explanation}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Step-by-Step Visual Dry Run Trace */}
            {currentProblem.dry_run_steps && currentProblem.dry_run_steps.length > 0 && (
              <div
                className={`border rounded-xl p-4 space-y-3 ${
                  isDark
                    ? "bg-[#111827] border-yellow-900/40"
                    : "bg-amber-50/60 border-amber-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                      Visual Dry Run Trace
                    </h4>
                  </div>
                  <div className="flex gap-1">
                    {currentProblem.dry_run_steps.map((_, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => setActiveDryRunStep(sIdx)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                          activeDryRunStep === sIdx
                            ? "bg-amber-500 text-slate-950 shadow-xs"
                            : isDark
                            ? "bg-[#1F2937] text-slate-400 hover:text-white"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Step {sIdx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Step Visual Box */}
                {currentProblem.dry_run_steps[activeDryRunStep] && (
                  <div
                    className={`border rounded-lg p-3 space-y-2 text-xs ${
                      isDark
                        ? "bg-[#0B0F19] border-[#1F2937]"
                        : "bg-white border-amber-200"
                    }`}
                  >
                    <div className="font-bold text-amber-500">
                      Step {currentProblem.dry_run_steps[activeDryRunStep].step}:{" "}
                      {currentProblem.dry_run_steps[activeDryRunStep].title}
                    </div>
                    <p
                      className={`leading-relaxed ${
                        isDark ? "text-white" : "text-slate-800"
                      }`}
                    >
                      {currentProblem.dry_run_steps[activeDryRunStep].explanation}
                    </p>
                    <div
                      className={`p-2 rounded border font-mono text-[11px] ${
                        isDark
                          ? "bg-[#111827] border-[#1F2937] text-orange-300"
                          : "bg-slate-50 border-slate-200 text-amber-900"
                      }`}
                    >
                      <span className="opacity-60 font-bold block mb-1">
                        Variable State Track:
                      </span>
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(
                          currentProblem.dry_run_steps[activeDryRunStep].variables,
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Asked By Companies */}
          {currentProblem.companies && currentProblem.companies.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold opacity-60 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Asked By Companies</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {currentProblem.companies.map((company) => (
                  <span
                    key={company}
                    className={`px-2.5 py-1 text-xs font-medium rounded border ${
                      isDark
                        ? "bg-[#111827] border-orange-900/40 text-orange-200"
                        : "bg-orange-50 border-orange-200 text-orange-800"
                    }`}
                  >
                    🏢 {company}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Topics Used Accordion */}
          <div
            className={`border rounded-lg overflow-hidden ${
              isDark ? "border-[#1F2937] bg-[#111827]/40" : "border-slate-200 bg-slate-50/50"
            }`}
          >
            <button
              onClick={() => setShowTopicsToggle(!showTopicsToggle)}
              className={`w-full px-4 py-2 flex items-center justify-between text-xs font-bold transition-colors ${
                isDark
                  ? "text-slate-200 hover:bg-[#1F2937]/60"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>Topics Used</span>
              </div>
              {showTopicsToggle ? (
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              )}
            </button>
            {showTopicsToggle && (
              <div
                className={`px-4 py-2.5 border-t flex flex-wrap gap-1.5 ${
                  isDark ? "border-[#1F2937] bg-[#0B0F19]" : "border-slate-200 bg-white"
                }`}
              >
                {currentProblem.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-2.5 py-0.5 text-xs font-medium rounded border ${
                      isDark
                        ? "bg-yellow-950/60 border-yellow-800/40 text-yellow-300"
                        : "bg-amber-50 border-amber-200 text-amber-800"
                    }`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Hints Accordion */}
          {currentProblem.hints && currentProblem.hints.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <span>Interactive Hints</span>
              </h3>

              <div className="space-y-2">
                {currentProblem.hints.map((hint, index) => (
                  <details
                    key={index}
                    className={`group border rounded-lg text-xs overflow-hidden transition-all ${
                      isDark
                        ? "bg-[#111827] border-[#1F2937]"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <summary className="p-3 font-bold text-amber-500 hover:text-amber-400 cursor-pointer flex items-center justify-between select-none">
                      <span className="flex items-center gap-2">
                        💡 Reveal Hint #{index + 1}
                      </span>
                      <ChevronDown className="w-4 h-4 opacity-60 group-open:rotate-180 transition-transform duration-200" />
                    </summary>

                    <div
                      className={`p-3 border-t space-y-3 ${
                        isDark
                          ? "border-[#1F2937] bg-[#0B0F19]"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <p className={isDark ? "text-slate-200" : "text-slate-800"}>
                        {hint}
                      </p>

                      <button
                        onClick={() => discussHintWithCoach(index, hint)}
                        className={`flex items-center gap-2 px-3 py-1.5 border text-xs font-medium rounded-md transition-all cursor-pointer ${
                          isDark
                            ? "bg-[#111827] hover:bg-[#1F2937] border-yellow-600/60 text-yellow-300 hover:text-white"
                            : "bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900"
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                        <span>Discuss Hint #{index + 1} with Socratic Coach</span>
                      </button>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Expected Time & Space Complexity */}
          <div className="pt-4">
            <div
              className={`rounded-xl p-4 transition-all duration-500 relative overflow-hidden ${
                isSolved
                  ? isDark
                    ? "bg-gradient-to-br from-green-950/70 to-yellow-950/70 border border-green-500/50 shadow-xl"
                    : "bg-green-50 border border-green-300 shadow-xs text-green-900"
                  : isDark
                  ? "glass-locked text-slate-400"
                  : "bg-red-50 border border-red-200 text-red-900"
              }`}
            >
              {isSolved ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-500 font-bold text-xs uppercase tracking-wider">
                    <Unlock className="w-4 h-4 text-green-500" />
                    <span>Complexity Specifications Unlocked!</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                    <div
                      className={`p-3 rounded-lg border ${
                        isDark
                          ? "bg-[#0B0F19]/80 border-green-900/50"
                          : "bg-white border-green-200"
                      }`}
                    >
                      <span className="opacity-60 block text-[10px] uppercase font-bold">
                        Time Complexity
                      </span>
                      <span className="text-green-500 font-bold text-sm">
                        {formatMathText(currentProblem.expected_time_complexity || "O(N)")}
                      </span>
                    </div>
                    <div
                      className={`p-3 rounded-lg border ${
                        isDark
                          ? "bg-[#0B0F19]/80 border-green-900/50"
                          : "bg-white border-green-200"
                      }`}
                    >
                      <span className="opacity-60 block text-[10px] uppercase font-bold">
                        Space Complexity
                      </span>
                      <span className="text-amber-500 font-bold text-sm">
                        {formatMathText(currentProblem.expected_space_complexity || "O(N)")}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${
                      isDark
                        ? "bg-red-950/80 border-red-800/50"
                        : "bg-red-100 border-red-200"
                    }`}
                  >
                    <Lock className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">
                      Complexity Specifications Locked
                    </h4>
                    <p className="text-[11px] opacity-75 leading-tight mt-0.5">
                      Locked until submission passes all test cases.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
