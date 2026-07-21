"use client";

import React from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import { CheckCircle2, ShieldCheck, Terminal, Cpu, Sun, Moon } from "lucide-react";

export default function HeaderNavbar() {
  const { isSolved, theme, toggleTheme } = useWorkspace();

  return (
    <header
      className={`h-14 border-b px-5 flex items-center justify-between z-20 select-none transition-colors ${
        theme === "dark"
          ? "bg-[#0B0F19] border-[#1F2937] text-white"
          : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-sm">
          <Cpu className="w-4.5 h-4.5 text-slate-950" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-base font-bold tracking-tight flex items-center gap-1.5">
            AI Powered <span className="text-amber-500">DSA Coach</span>
          </h1>
          <span className="text-[10px] text-slate-400 font-mono tracking-wider">
            Socratic Intelligence Platform v1.0
          </span>
        </div>
      </div>

      {/* Status Badges & Global Theme Switcher */}
      <div className="flex items-center gap-3">
        {/* Global Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Theme`}
          className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
            theme === "dark"
              ? "bg-[#111827] border-[#1F2937] text-amber-400 hover:bg-[#1F2937]"
              : "bg-slate-100 border-slate-200 text-amber-800 hover:bg-slate-200"
          }`}
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-slate-800" />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        {isSolved ? (
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold shadow-xs ${
              theme === "dark"
                ? "bg-green-950/80 border-green-700/60 text-green-300"
                : "bg-green-50 border-green-300 text-green-800"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            <span className="hidden sm:inline">Solved & Unlocked</span>
          </div>
        ) : (
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${
              theme === "dark"
                ? "bg-[#111827] border-[#1F2937] text-orange-300"
                : "bg-orange-50 border-orange-200 text-orange-800"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
            <span className="hidden sm:inline">In Progress</span>
          </div>
        )}

        <div
          className={`hidden sm:flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-md border ${
            theme === "dark"
              ? "bg-orange-950/50 border-orange-800/40 text-orange-300"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-orange-500" />
          <span>FastAPI</span>
        </div>
      </div>
    </header>
  );
}
