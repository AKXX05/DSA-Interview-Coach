"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

export default function Workspace() {
  // Editor States
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  
  // Database States
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  // Fetch the live data
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/problems")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          const fetchedProblem = data[0];
          setProblem(fetchedProblem);
          
          // Dynamically set the initial code from the database
          setCode(fetchedProblem.starter_code["python"] || "");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch problem:", err);
        setLoading(false);
      });
  }, []);

  // Handle changing the language dropdown
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    
    // Swap code instantly from the database JSON
    if (problem && problem.starter_code) {
      setCode(problem.starter_code[newLang] || "");
    }
  };

  
const executeCode = async (endpoint: string) => {
    if (!problem) return;
    setIsRunning(true);
    setOutput(`Executing securely (${endpoint})...`);
    
    try {
      const res = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // IMPORTANT: Added problem_id here!
        body: JSON.stringify({ code, language, problem_id: problem.id }),
      });
      
      const data = await res.json();
      if (res.ok) {
        // Format the new structured JSON into a readable console string
        if (data.status === "Success" || data.status === "Accepted") {
          setOutput(`✅ ${data.status}\nPassed ${data.total_passed} test cases!`);
        } else if (data.status === "Failed") {
          setOutput(`❌ Failed on case ${data.failed_case}\nInput: ${data.input}\nExpected: ${data.expected}\nActual: ${data.actual}`);
        } else if (data.status === "Wrong Answer") {
          setOutput(`❌ Wrong Answer on hidden case ${data.failed_case}`);
        } else {
          setOutput(`⚠️ ${data.status}\n${data.message || ""}`);
        }
      } else {
        setOutput(data.detail || "Error connecting to execution engine.");
      }
    } catch (error) {
      setOutput("Network error. Is your FastAPI server running?");
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunCode = () => executeCode("/api/run");
  const handleSubmitCode = () => executeCode("/api/submit");

  return (
    <div className="flex flex-col h-screen w-full bg-neutral-950 text-neutral-100">
      
      {/* Navbar */}
      <nav className="h-14 border-b border-neutral-800 flex items-center px-6 bg-neutral-900">
        <h1 className="text-xl font-bold text-emerald-400">
          AI Powered DSA Coach
        </h1>
      </nav>

      {/* Main Split Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Side: Problem Text */}
        <div className="w-1/2 p-8 border-r border-neutral-800 overflow-y-auto bg-neutral-950 pb-20">
          {loading ? (
            <p className="text-neutral-500 animate-pulse">Loading problem data from Supabase...</p>
          ) : problem ? (
            <>
              {/* Title & Difficulty */}
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl font-bold">
                  {problem.id}. {problem.title}
                </h2>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-900/30 text-emerald-400 border border-emerald-800/50">
                  {problem.difficulty}
                </span>
              </div>

              {/* Company & Topic Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {problem.companies?.map((company: string) => (
                  <span key={company} className="px-2 py-1 text-xs font-medium rounded bg-neutral-800 text-neutral-400">
                    🏢 {company}
                  </span>
                ))}
                {problem.tags?.map((tag: string) => (
                  <span key={tag} className="px-2 py-1 text-xs font-medium rounded bg-neutral-800 text-neutral-400">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-neutral-300 mb-8 whitespace-pre-wrap leading-relaxed">
                {problem.description}
              </p>
              
              {/* Examples */}
              <h3 className="font-bold text-lg mb-3 text-white">Examples</h3>
              {problem.sample_test_cases?.map((test: any, index: number) => (
                <div key={index} className="bg-neutral-900 p-4 rounded-lg border border-neutral-800 font-mono text-sm mb-4 overflow-x-auto shadow-inner">
                  <p className="text-neutral-500 mb-2">// Example {index + 1}</p>
                  <p className="mb-1"><span className="text-emerald-400 font-bold">Input:</span> {test.input}</p>
                  <p><span className="text-emerald-400 font-bold">Output:</span> {test.expected}</p>
                </div>
              ))}

              {/* Constraints */}
              <div className="mt-8">
                <h3 className="font-bold text-lg mb-3 text-white">Constraints</h3>
                <ul className="list-disc list-inside bg-neutral-900 p-4 rounded-lg border border-neutral-800 font-mono text-sm text-neutral-300 space-y-2">
                  {problem.constraints?.map((constraint: string, i: number) => (
                    <li key={i}>{constraint}</li>
                  ))}
                </ul>
              </div>

              {/* Hints */}
              {problem.hints && problem.hints.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-bold text-lg mb-3 text-white">Hints</h3>
                  <div className="flex flex-col gap-2">
                    {problem.hints.map((hint: string, index: number) => (
                      <details key={index} className="bg-neutral-900 rounded border border-neutral-800 text-sm group cursor-pointer">
                        <summary className="p-3 font-bold text-emerald-500 hover:text-emerald-400 select-none list-none flex justify-between items-center">
                          Hint {index + 1}
                          <span className="text-neutral-500 group-open:rotate-180 transition-transform duration-200">▼</span>
                        </summary>
                        <div className="p-3 text-neutral-300 border-t border-neutral-800 mt-2 pt-2">
                          {hint}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-red-400">Failed to load problem.</p>
          )}
        </div>

        {/* Right Side: Code Editor */}
        <div className="w-1/2 flex flex-col bg-neutral-900">
          <div className="h-12 border-b border-neutral-800 flex items-center justify-between px-4 bg-neutral-950">
            
            {/* Dynamic Language Dropdown */}
            <div className="flex items-center gap-2">
              <select 
                value={language}
                onChange={handleLanguageChange}
                className="bg-neutral-800 text-neutral-200 text-sm font-semibold py-1.5 px-3 rounded-md border border-neutral-700 outline-none focus:border-emerald-500 cursor-pointer"
              >
                {problem?.supported_languages?.map((lang: string) => (
                  <option key={lang} value={lang}>
                    {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* --- UPDATED BUTTON --- */}
            <button 
              onClick={handleRunCode}
              disabled={isRunning}
              className={`px-5 py-1.5 rounded-md text-sm font-bold transition-all shadow-lg ${
                isRunning 
                  ? "bg-neutral-600 text-neutral-400 cursor-not-allowed" 
                  : "bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-emerald-900/50"
              }`}
            >
              {isRunning ? "Running..." : "Run Code"}
            </button>

            {/* NEW: Your Submit Button */}
            <button 
              onClick={handleSubmitCode}
              disabled={isRunning}
              className="px-4 py-2 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-500 disabled:opacity-50 shadow-md"
            >
              Submit
            </button>
          </div>
          
          {/* EDITOR (Takes up top 70%) */}
          <div className="flex-7 pt-2 bg-[#1e1e1e]">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language}
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 15,
                scrollBeyondLastLine: false,
                padding: { top: 16 },
                smoothScrolling: true,
                cursorBlinking: "smooth"
              }}
            />
          </div>

          {/* --- NEW TERMINAL WINDOW (Takes up bottom 30%) --- */}
          <div className="flex-3 border-t border-neutral-800 bg-neutral-950 p-4 overflow-y-auto">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Console Output</h3>
            <pre className={`font-mono text-sm whitespace-pre-wrap ${
              output.includes("Error") || output.includes("Exception") 
                ? "text-red-400" 
                : "text-emerald-400"
            }`}>
              {output || "Run your code to see the output here."}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}