"use client";

import React from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import {
  FileText,
  Bold,
  Italic,
  Heading,
  List,
  Code,
  Sparkles
} from "lucide-react";

export default function ApproachEditor() {
  const {
    approachMarkdown,
    setApproachMarkdown,
    validateApproachWithCoach,
    isCoaching,
    theme,
    loading
  } = useWorkspace();

  const isDark = theme === "dark";

  if (loading) {
    return (
      <div className={`h-full w-full flex flex-col items-center justify-center transition-colors ${
        isDark ? "bg-[#0B0F19] text-slate-400" : "bg-white text-slate-500"
      }`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
          <span className="text-xs font-medium animate-pulse">Loading Workspace...</span>
        </div>
      </div>
    );
  }

  const insertMarkdown = (syntax: string) => {
    let newText = approachMarkdown;
    switch (syntax) {
      case "bold":
        newText += " **bold text**";
        break;
      case "italic":
        newText += " *italic text*";
        break;
      case "heading":
        newText += "\n### Approach Overview\n";
        break;
      case "list":
        newText += "\n- Step 1:\n- Step 2:\n";
        break;
      case "code":
        newText += "\n```pseudocode\n// Write logic here\n```\n";
        break;
      default:
        break;
    }
    setApproachMarkdown(newText);
  };

  return (
    <div
      className={`h-full flex flex-col overflow-hidden select-none transition-colors ${
        isDark ? "bg-[#0B0F19] text-white" : "bg-white text-slate-900"
      }`}
    >
      {/* Header Toolbar & Action Button */}
      <div
        className={`h-11 border-b px-4 flex items-center justify-between transition-colors ${
          isDark ? "bg-[#111827] border-[#1F2937]" : "bg-slate-50 border-slate-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <FileText className="w-4 h-4 text-amber-500" />
            <span>Algorithm Workspace</span>
          </div>

          {/* Markdown formatting bar */}
          <div className={`hidden sm:flex items-center gap-1 border-l pl-3 ${isDark ? "border-[#1F2937]" : "border-slate-200"}`}>
            <button
              onClick={() => insertMarkdown("bold")}
              title="Bold text"
              className={`p-1 rounded transition-colors ${isDark ? "hover:bg-[#1F2937] text-slate-400 hover:text-white" : "hover:bg-slate-200 text-slate-600 hover:text-slate-900"}`}
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown("italic")}
              title="Italic text"
              className={`p-1 rounded transition-colors ${isDark ? "hover:bg-[#1F2937] text-slate-400 hover:text-white" : "hover:bg-slate-200 text-slate-600 hover:text-slate-900"}`}
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown("heading")}
              title="Heading"
              className={`p-1 rounded transition-colors ${isDark ? "hover:bg-[#1F2937] text-slate-400 hover:text-white" : "hover:bg-slate-200 text-slate-600 hover:text-slate-900"}`}
            >
              <Heading className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown("list")}
              title="Bullet list"
              className={`p-1 rounded transition-colors ${isDark ? "hover:bg-[#1F2937] text-slate-400 hover:text-white" : "hover:bg-slate-200 text-slate-600 hover:text-slate-900"}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown("code")}
              title="Code block"
              className={`p-1 rounded transition-colors ${isDark ? "hover:bg-[#1F2937] text-slate-400 hover:text-white" : "hover:bg-slate-200 text-slate-600 hover:text-slate-900"}`}
            >
              <Code className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Refined Low-Contrast Action Button */}
        <button
          onClick={validateApproachWithCoach}
          disabled={isCoaching}
          className={`px-3 py-1.5 border text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50 ${
            isDark
              ? "bg-[#0B0F19] hover:bg-[#1F2937] border-[#1F2937] text-amber-400 hover:text-amber-300"
              : "bg-white hover:bg-slate-100 border-slate-300 text-amber-700 hover:text-amber-900"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Validate Approach with Coach</span>
        </button>
      </div>

      {/* Pseudocode Text Area with Guaranteed Visible Vertical & Horizontal Scrollbars */}
      <div className={`flex-1 p-3 relative select-text h-0 ${isDark ? "bg-[#0B0F19]" : "bg-white"}`}>
        <textarea
          value={approachMarkdown}
          onChange={(e) => setApproachMarkdown(e.target.value)}
          wrap="off"
          placeholder="Explain your algorithmic thinking in plain English or markdown before coding...

Example:
- Use a Hash Map to store elements as keys and their indices as values.
- Iterate through nums array: calculate complement = target - nums[i].
- If complement in map -> return [map[complement], i].
- Time Complexity: O(N), Space Complexity: O(N)."
          style={{ overflowX: "scroll", overflowY: "scroll" }}
          className={`w-full h-full border rounded-lg p-3 text-xs font-mono placeholder-slate-400 outline-none focus:border-amber-500 resize-none leading-relaxed transition-colors whitespace-pre ${
            isDark
              ? "bg-[#111827] border-[#1F2937] text-white"
              : "bg-slate-50 border-slate-200 text-slate-900"
          }`}
        />
      </div>
    </div>
  );
}
