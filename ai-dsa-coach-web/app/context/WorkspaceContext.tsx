"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Problem, ChatMessage, ExecutionResult } from "../types/dsa";

interface WorkspaceContextType {
  problems: Problem[];
  currentProblem: Problem | null;
  loading: boolean;
  isSolved: boolean;
  solvedProblemIds: number[];
  theme: "dark" | "light";
  language: string;
  code: string;
  approachMarkdown: string;
  executionResult: ExecutionResult;
  runResult: ExecutionResult;
  submissionResult: ExecutionResult;
  terminalTab: "testcases" | "results" | "submission";
  customTestInput: string;
  chatHistory: ChatMessage[];
  isCoaching: boolean;
  inputMessage: string;
  
  // Timer State & Controls
  timerSeconds: number;
  isTimerRunning: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;

  // AI Problem Generator
  isGeneratingProblem: boolean;
  generateNewProblem: (topic?: string, difficulty?: string) => Promise<Problem | null>;

  // Setters & Actions
  toggleTheme: () => void;
  selectProblem: (problemId: number) => void;
  setLanguage: (lang: string) => void;
  setCode: (code: string) => void;
  setApproachMarkdown: (text: string) => void;
  setTerminalTab: (tab: "testcases" | "results" | "submission") => void;
  setCustomTestInput: (input: string) => void;
  setInputMessage: (msg: string) => void;
  resetCode: () => void;
  runCode: (customCases?: string[]) => Promise<void>;
  submitCode: () => Promise<void>;
  sendCoachMessage: (messageText?: string, payloadType?: ChatMessage["payloadType"]) => Promise<void>;
  validateApproachWithCoach: () => void;
  discussHintWithCoach: (hintIndex: number, hintText: string) => void;
  clearChat: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const MOCK_PROBLEMS: Problem[] = [
  {
    id: 1,
    problem_code: "1",
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Arrays", "Hash Table"],
    companies: ["Google", "Amazon", "Meta", "Microsoft"],
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    sample_test_cases: [
      {
        input: "nums = [2,7,11,15], target = 9",
        expected: "[0, 1]",
        explanation: "Because nums[0] + nums[1] == 2 + 7 == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        expected: "[1, 2]",
        explanation: "Because nums[1] + nums[2] == 2 + 4 == 6, we return [1, 2]."
      },
      {
        input: "nums = [3,3], target = 6",
        expected: "[0, 1]",
        explanation: "Because nums[0] + nums[1] == 3 + 3 == 6, we return [0, 1]."
      }
    ],
    starter_code: {
      python: "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write your code here\n        pass",
      cpp: "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        return {};\n    }\n};",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}"
    },
    dry_run_steps: [
      {
        step: 1,
        title: "Initialize Hash Map & Loop Index 0",
        explanation: "Element at index 0 is 2. Calculate complement = 9 - 2 = 7. Hash map is empty {}.",
        variables: { index: 0, val: 2, complement: 7, hashMap: {} }
      },
      {
        step: 2,
        title: "Store Index 0 & Move to Index 1",
        explanation: "Store index 0 -> hashMap[2] = 0. Element at index 1 is 7. Calculate complement = 9 - 7 = 2.",
        variables: { index: 1, val: 7, complement: 2, hashMap: { "2": 0 } }
      },
      {
        step: 3,
        title: "Match Found!",
        explanation: "Complement 2 exists in hashMap at index 0. Return indices [0, 1].",
        variables: { matchIndex: 0, currentIndex: 1, result: "[0, 1]" }
      }
    ],
    hints: [
      "A really brute force way would be to search for all possible pairs, which takes O(N^2) time. Can we do better using extra space?",
      "Can we use a Hash Table to look up the complement in O(1) time?",
      "Iterate through the array once: for each element `x`, check if `target - x` is already in your Hash Map."
    ],
    expected_time_complexity: "O(N)",
    expected_space_complexity: "O(N)",
    time_limit: 1.0,
    memory_limit: 256,
    supported_languages: ["python", "cpp", "java"]
  }
];

const getDifficultySeconds = (diff?: string) => {
  switch (diff) {
    case "Easy":
      return 15 * 60; // 15 mins = 900s
    case "Medium":
      return 25 * 60; // 25 mins = 1500s
    case "Hard":
      return 40 * 60; // 40 mins = 2400s
    default:
      return 15 * 60;
  }
};

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [solvedProblemIds, setSolvedProblemIds] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dsa_coach_solved_ids");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  const markProblemSolved = (id: number) => {
    setSolvedProblemIds((prev) => {
      if (!prev.includes(id)) {
        const next = [...prev, id];
        localStorage.setItem("dsa_coach_solved_ids", JSON.stringify(next));
        return next;
      }
      return prev;
    });
  };
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [language, setLanguage] = useState<string>("python");
  const [code, setCode] = useState<string>("");
  const [approachMarkdown, setApproachMarkdown] = useState<string>("");
  const [terminalTab, setTerminalTab] = useState<"testcases" | "results" | "submission">("testcases");
  const [customTestInput, setCustomTestInput] = useState<string>("");

  // Timer State Management (15m Easy, 25m Medium, 40m Hard)
  const [timerSeconds, setTimerSeconds] = useState<number>(15 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Generative AI Problem Generator State
  const [isGeneratingProblem, setIsGeneratingProblem] = useState<boolean>(false);

  const [runResult, setRunResult] = useState<ExecutionResult>({
    status: "Idle",
    message: "Click 'Run Code' to execute sample test cases."
  });

  const [submissionResult, setSubmissionResult] = useState<ExecutionResult>({
    status: "Idle",
    message: "No submission yet. Click 'Submit Code' to evaluate against hidden test cases."
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isCoaching, setIsCoaching] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("dsa_coach_theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === "dark") {
      root.classList.add("dark");
      body.classList.add("dark");
      root.style.backgroundColor = "#0B0F19";
      body.style.backgroundColor = "#0B0F19";
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      body.classList.remove("dark");
      root.style.backgroundColor = "#ffffff";
      body.style.backgroundColor = "#ffffff";
      root.style.colorScheme = "light";
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("dsa_coach_theme", nextTheme);
      return nextTheme;
    });
  };

  // Timer Countdown Interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  // Auto-start timer reset when switching problems
  useEffect(() => {
    if (currentProblem) {
      const secs = getDifficultySeconds(currentProblem.difficulty);
      setTimerSeconds(secs);
      setIsTimerRunning(true);
    }
  }, [currentProblem?.id]);

  const toggleTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  const resetTimer = () => {
    const secs = getDifficultySeconds(currentProblem?.difficulty);
    setTimerSeconds(secs);
    setIsTimerRunning(true);
  };

  const fetchProblems = (isInitial = false) => {
    fetch("http://127.0.0.1:8000/api/problems")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          const apiProblems: Problem[] = data.map((p: any, idx: number) => ({
            id: p.id || idx + 1,
            problem_code: String(p.id || idx + 1),
            title: p.title,
            description: p.description,
            difficulty: p.difficulty || "Easy",
            topic: p.topic || "Arrays",
            tags: p.tags || [p.topic || "Arrays"],
            companies: p.companies || ["Google", "Amazon"],
            constraints: p.constraints || [],
            sample_test_cases: (p.sample_test_cases || []).map((tc: any, tcIdx: number) => ({
              input: tc.input,
              expected: tc.expected,
              explanation: tc.explanation || (
                tcIdx === 0
                  ? "Because nums[0] + nums[1] == 2 + 7 == 9, we return [0, 1]."
                  : tcIdx === 1
                  ? "Because nums[1] + nums[2] == 2 + 4 == 6, we return [1, 2]."
                  : "Because nums[0] + nums[1] == 3 + 3 == 6, we return [0, 1]."
              )
            })),
            starter_code: p.starter_code || {},
            dry_run_steps: p.dry_run_steps || [],
            hints: p.hints || [],
            expected_time_complexity: p.expected_time_complexity || "O(N)",
            expected_space_complexity: p.expected_space_complexity || "O(N)",
            time_limit: p.time_limit || 1.0,
            memory_limit: p.memory_limit || 256,
            supported_languages: p.supported_languages || ["python", "cpp", "java"]
          }));
          setProblems(apiProblems);
          setLoading(false);
          if (isInitial) {
            const savedId = localStorage.getItem("dsa_coach_active_problem_id");
            const initialProb = apiProblems.find((p) => String(p.id) === savedId) || apiProblems[0];
            setCurrentProblem(initialProb);
            const savedLanguage = localStorage.getItem("dsa_coach_active_language") || "python";
            setLanguage(savedLanguage);
            const savedCode = localStorage.getItem(`dsa_coach_code_${initialProb.id}_${savedLanguage}`);
            const defaultCode = initialProb.starter_code[savedLanguage] || initialProb.starter_code["python"] || "";
            setCode(savedCode || defaultCode);
            setCustomTestInput(initialProb.sample_test_cases[0]?.input || "");
            setIsSolved(solvedProblemIds.includes(initialProb.id));
          }
        }
      })
      .catch((err) => {
        console.warn("Backend API offline, using fallback mock problems.", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProblems(true);
    const interval = setInterval(() => fetchProblems(false), 10000);
    return () => clearInterval(interval);
  }, []);

  const selectProblem = (problemId: number) => {
    const found = problems.find((p) => p.id === problemId);
    if (found) {
      setCurrentProblem(found);
      localStorage.setItem("dsa_coach_active_problem_id", String(found.id));
      const savedCode = localStorage.getItem(`dsa_coach_code_${found.id}_${language}`);
      const defaultCode = found.starter_code[language] || found.starter_code["python"] || "";
      setCode(savedCode || defaultCode);
      setIsSolved(solvedProblemIds.includes(found.id));
      setRunResult({
        status: "Idle",
        message: "Click 'Run Code' to execute sample test cases."
      });
      setSubmissionResult({
        status: "Idle",
        message: "No submission yet. Click 'Submit Code' to evaluate against hidden test cases."
      });
      setCustomTestInput(found.sample_test_cases[0]?.input || "");
    }
  };

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("dsa_coach_active_language", lang);
    if (currentProblem && currentProblem.starter_code) {
      const savedCode = localStorage.getItem(`dsa_coach_code_${currentProblem.id}_${lang}`);
      const defaultCode = currentProblem.starter_code[lang] || currentProblem.starter_code["python"] || "";
      setCode(savedCode || defaultCode);
    }
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (currentProblem) {
      localStorage.setItem(`dsa_coach_code_${currentProblem.id}_${language}`, newCode);
    }
  };

  const resetCode = () => {
    if (currentProblem && currentProblem.starter_code) {
      const defaultCode = currentProblem.starter_code[language] || currentProblem.starter_code["python"] || "";
      setCode(defaultCode);
      localStorage.removeItem(`dsa_coach_code_${currentProblem.id}_${language}`);
    }
  };

  const runCode = async (customCases?: string[]) => {
    if (!currentProblem) return;

    setTerminalTab("results");
    setRunResult({ status: "Running", message: "Executing code against sample test cases..." });

    try {
      const res = await fetch("http://127.0.0.1:8000/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_id: currentProblem.id,
          code: code,
          language: language,
          custom_inputs: customCases && customCases.length > 0 ? customCases : undefined
        })
      });

      const data = await res.json();
      setRunResult(data);
    } catch (err: any) {
      setRunResult({
        status: "Error",
        message: err.message || "Failed to communicate with backend API server."
      });
    }
  };

  const submitCode = async () => {
    if (!currentProblem) return;

    setTerminalTab("submission");
    setSubmissionResult({ status: "Running", message: "Evaluating solution against hidden test cases..." });

    try {
      const res = await fetch("http://127.0.0.1:8000/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_id: currentProblem.id,
          code: code,
          language: language
        })
      });

      const data = await res.json();

      if (data.status === "Accepted") {
        setIsSolved(true);
        if (currentProblem) {
          markProblemSolved(currentProblem.id);
        }
        setSubmissionResult({
          status: "Accepted",
          message: `Accepted! Passed all ${data.total_passed} test cases.`
        });
      } else {
        setSubmissionResult({
          status: data.status,
          message: data.message || `Submission failed at test case ${data.failed_case}`
        });
      }
    } catch (err: any) {
      setSubmissionResult({
        status: "Error",
        message: err.message || "Failed to connect to execution server."
      });
    }
  };

  const generateNewProblem = async (topic: string = "Arrays", difficulty: string = "Medium"): Promise<Problem | null> => {
    setIsGeneratingProblem(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/generate-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty })
      });

      if (!res.ok) {
        throw new Error("API failed to generate problem");
      }

      const p = await res.json();
      const newProblem: Problem = {
        id: p.id,
        problem_code: String(p.id),
        title: p.title,
        description: p.description,
        difficulty: (p.difficulty || difficulty) as "Easy" | "Medium" | "Hard",
        topic: p.topic || topic,
        tags: p.tags || [topic],
        companies: p.companies || ["Google", "Meta"],
        constraints: p.constraints || [],
        sample_test_cases: p.sample_test_cases || [],
        starter_code: p.starter_code || {},
        dry_run_steps: p.dry_run_steps || [],
        hints: p.hints || [],
        expected_time_complexity: p.expected_time_complexity || "O(N)",
        expected_space_complexity: p.expected_space_complexity || "O(1)",
        time_limit: p.time_limit || 1.0,
        memory_limit: p.memory_limit || 256,
        supported_languages: p.supported_languages || ["python", "cpp", "java"]
      };

      setProblems((prev) => [newProblem, ...prev]);
      setCurrentProblem(newProblem);
      setCode(newProblem.starter_code["python"] || "");
      setCustomTestInput(newProblem.sample_test_cases[0]?.input || "");
      setIsGeneratingProblem(false);
      return newProblem;
    } catch (err) {
      console.warn("AI generation failed, creating local dynamic fallback problem.", err);
      const fallbackId = problems.length + 100;
      const fallbackProblem: Problem = {
        id: fallbackId,
        problem_code: String(fallbackId),
        title: `Dynamic AI ${topic} Challenge`,
        description: `Given a collection of data structures for topic ${topic}, compute the optimal arrangement satisfying ${difficulty} constraints.`,
        difficulty: difficulty as "Easy" | "Medium" | "Hard",
        topic: topic,
        tags: [topic],
        companies: ["Google", "Amazon"],
        constraints: ["1 <= N <= 10^5"],
        sample_test_cases: [{ input: "nums = [1, 2, 3]", expected: "6", explanation: "Calculated optimal sum." }],
        starter_code: {
          python: `class Solution:\n    def solve(self):\n        # ${topic} Solution\n        pass`
        },
        dry_run_steps: [
          { step: 1, title: "Initialize state", explanation: "Reading input parameters.", variables: { ready: true } }
        ],
        hints: [`Consider optimal ${difficulty} approach for ${topic}.`],
        expected_time_complexity: "O(N)",
        expected_space_complexity: "O(1)",
        time_limit: 1.0,
        memory_limit: 256,
        supported_languages: ["python", "cpp", "java"]
      };

      setProblems((prev) => [fallbackProblem, ...prev]);
      setCurrentProblem(fallbackProblem);
      setCode(fallbackProblem.starter_code["python"] || "");
      setCustomTestInput(fallbackProblem.sample_test_cases[0]?.input || "");
      setIsGeneratingProblem(false);
      return fallbackProblem;
    }
  };

  const sendCoachMessage = async (messageText?: string, payloadType?: ChatMessage["payloadType"]) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || isCoaching || !currentProblem) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      payloadType: payloadType
    };

    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setInputMessage("");
    setIsCoaching(true);

    const botMsgId = (Date.now() + 1).toString();
    const initialBotMsg: ChatMessage = {
      id: botMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatHistory((prev) => [...prev, initialBotMsg]);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_id: currentProblem.id,
          code: code,
          language: language,
          chat_history: updatedHistory.map((m) => ({ role: m.role, content: m.content })),
          console_output: runResult.status !== "Idle" ? runResult.message : undefined
        })
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      if (!res.body) throw new Error("No response stream body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        
        setChatHistory((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId ? { ...msg, content: msg.content + chunk } : msg
          )
        );
      }
    } catch (err: any) {
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId
            ? {
                ...msg,
                content: "I am having trouble connecting to my AI servers. Let's analyze your code logic step-by-step: What condition triggers your loop termination?"
              }
            : msg
        )
      );
    } finally {
      setIsCoaching(false);
    }
  };

  const validateApproachWithCoach = () => {
    if (!approachMarkdown.trim()) return;
    sendCoachMessage(
      `Please review my proposed algorithm approach:\n\n${approachMarkdown}`,
      "approach_validation"
    );
  };

  const discussHintWithCoach = (hintIndex: number, hintText: string) => {
    sendCoachMessage(
      `I'm looking at Hint #${hintIndex + 1}: "${hintText}". Can you guide me on how to apply this to my current solution?`,
      "hint_discussion"
    );
  };

  const clearChat = () => {
    setChatHistory([]);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        problems,
        currentProblem,
        loading,
        isSolved,
        solvedProblemIds,
        theme,
        language,
        code,
        approachMarkdown,
        executionResult: runResult,
        runResult,
        submissionResult,
        terminalTab,
        customTestInput,
        chatHistory,
        isCoaching,
        inputMessage,
        timerSeconds,
        isTimerRunning,
        toggleTimer,
        resetTimer,
        isGeneratingProblem,
        generateNewProblem,
        toggleTheme,
        selectProblem,
        setLanguage: handleSetLanguage,
        setCode: handleCodeChange,
        setApproachMarkdown,
        setTerminalTab,
        setCustomTestInput,
        setInputMessage,
        resetCode,
        runCode,
        submitCode,
        sendCoachMessage,
        validateApproachWithCoach,
        discussHintWithCoach,
        clearChat
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
