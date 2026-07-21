"use client";

import React from "react";
import { WorkspaceProvider, useWorkspace } from "./context/WorkspaceContext";
import HeaderNavbar from "./components/HeaderNavbar";
import ResizableLayout from "./components/ResizableLayout";

function MainApp() {
  const { theme } = useWorkspace();

  return (
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden font-sans transition-colors ${
        theme === "dark" ? "bg-[#0B0F19] text-slate-100" : "bg-white text-slate-900"
      }`}
    >
      <HeaderNavbar />
      <ResizableLayout />
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <WorkspaceProvider>
      <MainApp />
    </WorkspaceProvider>
  );
}