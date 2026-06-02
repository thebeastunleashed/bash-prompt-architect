export type PromptPartType = 'escape' | 'text' | 'color' | 'bg-color' | 'formatting' | 'special';

export interface PromptPart {
  id: string;
  type: PromptPartType;
  label: string;
  value: string;
  preview: string;
  color?: string;
}

export interface ColorOption {
  name: string;
  code: string;
  hex: string;
}

export interface TerminalTheme {
  id: string;
  name: string;
  bg: string;
  text: string;
  border: string;
  titleBar: string;
  tabBar: string;
}

export interface SavedConfig {
  id: string;
  name: string;
  parts: PromptPart[];
  timestamp: number;
}
