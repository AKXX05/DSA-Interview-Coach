export interface TestCase {
  input: string;
  expected: string;
  explanation?: string;
}

export interface DryRunStep {
  step: number;
  title: string;
  variables: Record<string, string | number | boolean | object>;
  explanation: string;
}

export interface Problem {
  id: number;
  problem_code?: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic?: string;
  tags: string[];
  companies: string[];
  hints: string[];
  constraints: string[];
  time_limit: number;
  memory_limit: number;
  expected_time_complexity: string;
  expected_space_complexity: string;
  supported_languages: string[];
  starter_code: Record<string, string>;
  sample_test_cases: TestCase[];
  hidden_test_cases?: TestCase[];
  dry_run_steps?: DryRunStep[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  payloadType?: "general" | "approach_validation" | "hint_discussion" | "error_debug";
}

export interface TestCaseResult {
  case: number;
  status: "Passed" | "Executed" | "Wrong Answer" | "Runtime Error" | "Time Limit Exceeded" | "Compile Error";
  input: string;
  expected?: string;
  actual?: string;
  stdout?: string;
  error?: string;
}

export interface ExecutionResult {
  status: "Idle" | "Running" | "Success" | "Accepted" | "Failed" | "Wrong Answer" | "Compile Error" | "Runtime Error" | "Time Limit Exceeded" | "Executed" | "Error";
  message?: string;
  total_passed?: number;
  total_cases?: number;
  failed_case?: number;
  input?: string;
  expected?: string;
  actual?: string;
  stdout?: string;
  error?: string;
  runtime?: string;
  memory?: string;
  results?: TestCaseResult[];
}

export interface TopicCategory {
  name: string;
  iconName: string;
  problems: Problem[];
}
