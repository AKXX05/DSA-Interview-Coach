"use client";

import React from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { useWorkspace } from "../context/WorkspaceContext";
import ProblemPanel from "./ProblemPanel";
import CodeWorkspace from "./CodeWorkspace";
import ApproachEditor from "./ApproachEditor";
import ExecutionTerminal from "./ExecutionTerminal";
import CoachPanel from "./CoachPanel";

export default function ResizableLayout() {
  const { theme } = useWorkspace();
  const isDark = theme === "dark";

  return (
    <div
      className={`flex-1 w-full h-[calc(100vh-3.5rem)] overflow-hidden select-none transition-colors ${
        isDark ? "bg-[#0B0F19]" : "bg-white"
      }`}
    >
      <Group orientation="horizontal" id="dsa-coach-horizontal-layout">
        {/* --- COLUMN 1: PROBLEM DISCOVERY & DETAILS PANEL (Left, ~30% width) --- */}
        <Panel defaultSize="30%" minSize="20%" maxSize="45%" className="h-full">
          <ProblemPanel />
        </Panel>

        {/* Vertical Draggable Splitter Handle (Left/Center) */}
        <Separator
          className={`w-1.5 transition-colors flex items-center justify-center cursor-col-resize group relative z-10 ${
            isDark
              ? "bg-[#0B0F19] hover:bg-amber-500/30 active:bg-amber-400/50"
              : "bg-slate-200 hover:bg-amber-400 active:bg-amber-500"
          }`}
        >
          <div
            className={`w-0.5 h-8 rounded-full transition-colors ${
              isDark
                ? "bg-[#1F2937] group-hover:bg-amber-400"
                : "bg-slate-400 group-hover:bg-slate-900"
            }`}
          ></div>
        </Separator>

        {/* --- COLUMN 2: WORKSPACE & LOGIC PANEL (Center, ~45% width) --- */}
        <Panel defaultSize="45%" minSize="30%" maxSize="60%" className="h-full">
          <Group orientation="vertical" id="dsa-coach-center-vertical-layout">
            {/* Upper Portion: Code Workspace (Default ~60% height) */}
            <Panel defaultSize="60%" minSize="25%" maxSize="80%" className="w-full">
              <CodeWorkspace />
            </Panel>

            {/* Horizontal Draggable Splitter Handle */}
            <Separator
              className={`h-1.5 transition-colors flex items-center justify-center cursor-row-resize group relative z-10 ${
                isDark
                  ? "bg-[#0B0F19] hover:bg-amber-500/30 active:bg-amber-400/50"
                  : "bg-slate-200 hover:bg-amber-400 active:bg-amber-500"
              }`}
            >
              <div
                className={`h-0.5 w-8 rounded-full transition-colors ${
                  isDark
                    ? "bg-[#1F2937] group-hover:bg-amber-400"
                    : "bg-slate-400 group-hover:bg-slate-900"
                }`}
              ></div>
            </Separator>

            {/* Lower Portion: Algorithm Workspace (Default ~40% height) */}
            <Panel defaultSize="40%" minSize="20%" maxSize="75%" className="w-full">
              <ApproachEditor />
            </Panel>
          </Group>
        </Panel>

        {/* Vertical Draggable Splitter Handle (Center/Right) */}
        <Separator
          className={`w-1.5 transition-colors flex items-center justify-center cursor-col-resize group relative z-10 ${
            isDark
              ? "bg-[#0B0F19] hover:bg-amber-500/30 active:bg-amber-400/50"
              : "bg-slate-200 hover:bg-amber-400 active:bg-amber-500"
          }`}
        >
          <div
            className={`w-0.5 h-8 rounded-full transition-colors ${
              isDark
                ? "bg-[#1F2937] group-hover:bg-amber-400"
                : "bg-slate-400 group-hover:bg-slate-900"
            }`}
          ></div>
        </Separator>

        {/* --- COLUMN 3: EXECUTION & AI COACH PANEL (Right, ~25% width) --- */}
        <Panel defaultSize="25%" minSize="20%" maxSize="45%" className="h-full">
          <Group orientation="vertical" id="dsa-coach-right-vertical-layout">
            {/* Upper Portion: Output & Terminal (Initial Default 50% height) */}
            <Panel defaultSize="50%" minSize="20%" maxSize="80%" className="w-full">
              <ExecutionTerminal />
            </Panel>

            {/* Horizontal Draggable Splitter Handle */}
            <Separator
              className={`h-1.5 transition-colors flex items-center justify-center cursor-row-resize group relative z-10 ${
                isDark
                  ? "bg-[#0B0F19] hover:bg-amber-500/30 active:bg-amber-400/50"
                  : "bg-slate-200 hover:bg-amber-400 active:bg-amber-500"
              }`}
            >
              <div
                className={`h-0.5 w-8 rounded-full transition-colors ${
                  isDark
                    ? "bg-[#1F2937] group-hover:bg-amber-400"
                    : "bg-slate-400 group-hover:bg-slate-900"
                }`}
              ></div>
            </Separator>

            {/* Lower Portion: Socratic AI Coach (Initial Default 50% height) */}
            <Panel defaultSize="50%" minSize="20%" maxSize="80%" className="w-full">
              <CoachPanel />
            </Panel>
          </Group>
        </Panel>
      </Group>
    </div>
  );
}
