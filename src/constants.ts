import { PromptPart, ColorOption, TerminalTheme } from './types';

export const ESCAPE_SEQUENCES: Omit<PromptPart, 'id'>[] = [
  { type: 'escape', label: 'Username', value: '\\u', preview: 'user' },
  { type: 'escape', label: 'Hostname (short)', value: '\\h', preview: 'host' },
  { type: 'escape', label: 'Hostname (full)', value: '\\H', preview: 'host.local' },
  { type: 'escape', label: 'Working Dir (short)', value: '\\W', preview: 'current' },
  { type: 'escape', label: 'Working Dir (full)', value: '\\w', preview: '~/path/to/current' },
  { type: 'escape', label: 'Time (24h)', value: '\\t', preview: '14:30:05' },
  { type: 'escape', label: 'Time (12h)', value: '\\T', preview: '02:30:05' },
  { type: 'escape', label: 'Time (am/pm)', value: '\\@', preview: '02:30 PM' },
  { type: 'escape', label: 'Date', value: '\\d', preview: 'Sun Mar 29' },
  { type: 'escape', label: 'Shell Name', value: '\\s', preview: 'bash' },
  { type: 'escape', label: 'Shell Version', value: '\\v', preview: '5.0' },
  { type: 'escape', label: 'Newline', value: '\\n', preview: '\n' },
  { type: 'escape', label: 'Prompt Char ($/#)', value: '\\$', preview: '$' },
  { type: 'escape', label: 'History Number', value: '\\!', preview: '42' },
  { type: 'escape', label: 'Command Number', value: '\\#', preview: '12' },
];

export const COLORS: ColorOption[] = [
  { name: 'Black', code: '30', hex: '#000000' },
  { name: 'Red', code: '31', hex: '#ef4444' },
  { name: 'Green', code: '32', hex: '#22c55e' },
  { name: 'Yellow', code: '33', hex: '#eab308' },
  { name: 'Blue', code: '34', hex: '#3b82f6' },
  { name: 'Purple', code: '35', hex: '#a855f7' },
  { name: 'Cyan', code: '36', hex: '#06b6d4' },
  { name: 'White', code: '37', hex: '#ffffff' },
  { name: 'Gray', code: '90', hex: '#6b7280' },
  { name: 'Light Red', code: '91', hex: '#f87171' },
  { name: 'Light Green', code: '92', hex: '#4ade80' },
  { name: 'Light Yellow', code: '93', hex: '#fde047' },
  { name: 'Light Blue', code: '94', hex: '#60a5fa' },
  { name: 'Light Purple', code: '95', hex: '#c084fc' },
  { name: 'Light Cyan', code: '96', hex: '#22d3ee' },
  { name: 'Bright White', code: '97', hex: '#f9fafb' },
];

export const BG_COLORS: ColorOption[] = [
  { name: 'Black BG', code: '40', hex: '#000000' },
  { name: 'Red BG', code: '41', hex: '#ef4444' },
  { name: 'Green BG', code: '42', hex: '#22c55e' },
  { name: 'Yellow BG', code: '43', hex: '#eab308' },
  { name: 'Blue BG', code: '44', hex: '#3b82f6' },
  { name: 'Purple BG', code: '45', hex: '#a855f7' },
  { name: 'Cyan BG', code: '46', hex: '#06b6d4' },
  { name: 'White BG', code: '47', hex: '#ffffff' },
  { name: 'Gray BG', code: '100', hex: '#6b7280' },
  { name: 'Light Red BG', code: '101', hex: '#f87171' },
  { name: 'Light Green BG', code: '102', hex: '#4ade80' },
  { name: 'Light Yellow BG', code: '103', hex: '#fde047' },
  { name: 'Light Blue BG', code: '104', hex: '#60a5fa' },
  { name: 'Light Purple BG', code: '105', hex: '#c084fc' },
  { name: 'Light Cyan BG', code: '106', hex: '#22d3ee' },
  { name: 'Bright White BG', code: '107', hex: '#f9fafb' },
];

export const FORMATTING: Omit<PromptPart, 'id'>[] = [
  { type: 'formatting', label: 'Bold', value: '1', preview: '' },
  { type: 'formatting', label: 'Dim', value: '2', preview: '' },
  { type: 'formatting', label: 'Italic', value: '3', preview: '' },
  { type: 'formatting', label: 'Underline', value: '4', preview: '' },
  { type: 'formatting', label: 'Blink', value: '5', preview: '' },
  { type: 'formatting', label: 'Invert', value: '7', preview: '' },
  { type: 'formatting', label: 'Hidden', value: '8', preview: '' },
  { type: 'formatting', label: 'Strikethrough', value: '9', preview: '' },
  { type: 'formatting', label: 'Reset All', value: '0', preview: '' },
  { type: 'formatting', label: 'Reset FG', value: '39', preview: '' },
  { type: 'formatting', label: 'Reset BG', value: '49', preview: '' },
];

export const SPECIAL_CHARS: Omit<PromptPart, 'id'>[] = [
  { type: 'special', label: 'Space', value: ' ', preview: ' ' },
  { type: 'special', label: '@ Symbol', value: '@', preview: '@' },
  { type: 'special', label: ': Symbol', value: ':', preview: ':' },
  { type: 'special', label: '[ Bracket', value: '[', preview: '[' },
  { type: 'special', label: '] Bracket', value: ']', preview: ']' },
  { type: 'special', label: '( Paren', value: '(', preview: '(' },
  { type: 'special', label: ') Paren', value: ')', preview: ')' },
  { type: 'special', label: '> Arrow', value: '>', preview: '>' },
];

export const EMOJIS: Omit<PromptPart, 'id'>[] = [
  { type: 'text', label: 'Rocket', value: '🚀', preview: '🚀' },
  { type: 'text', label: 'Fire', value: '🔥', preview: '🔥' },
  { type: 'text', label: 'Star', value: '⭐', preview: '⭐' },
  { type: 'text', label: 'Heart', value: '❤️', preview: '❤️' },
  { type: 'text', label: 'Check', value: '✅', preview: '✅' },
  { type: 'text', label: 'Warning', size: 14, value: '⚠️', preview: '⚠️' } as any,
  { type: 'text', label: 'Ghost', value: '👻', preview: '👻' },
  { type: 'text', label: 'Alien', value: '👽', preview: '👽' },
  { type: 'text', label: 'Robot', value: '🤖', preview: '🤖' },
  { type: 'text', label: 'Lightning', value: '⚡', preview: '⚡' },
  { type: 'text', label: 'Diamond', value: '💎', preview: '💎' },
  { type: 'text', label: 'Lock', value: '🔒', preview: '🔒' },
  { type: 'text', label: 'Terminal', value: '💻', preview: '💻' },
  { type: 'text', label: 'Package', value: '📦', preview: '📦' },
  { type: 'text', label: 'Bug', value: '🐛', preview: '🐛' },
  { type: 'text', label: 'Coffee', value: '☕', preview: '☕' },
];

export interface PromptExample {
  name: string;
  parts: Omit<PromptPart, 'id'>[];
}

export const PROMPT_EXAMPLES: PromptExample[] = [
  {
    name: 'Classic Pro',
    parts: [
      { type: 'formatting', label: 'Reset All', value: '0', preview: '' },
      { type: 'color', label: 'Green', value: '32', preview: '' },
      { type: 'escape', label: 'Username', value: '\\u', preview: 'user' },
      { type: 'color', label: 'White', value: '37', preview: '' },
      { type: 'special', label: '@ Symbol', value: '@', preview: '@' },
      { type: 'color', label: 'Cyan', value: '36', preview: '' },
      { type: 'escape', label: 'Hostname (short)', value: '\\h', preview: 'host' },
      { type: 'special', label: 'Space', value: ' ', preview: ' ' },
      { type: 'color', label: 'Yellow', value: '33', preview: '' },
      { type: 'escape', label: 'Working Dir (short)', value: '\\W', preview: 'current' },
      { type: 'color', label: 'White', value: '37', preview: '' },
      { type: 'special', label: 'Space', value: ' ', preview: ' ' },
      { type: 'escape', label: 'Prompt Char ($/#)', value: '\\$', preview: '$' },
      { type: 'special', label: 'Space', value: ' ', preview: ' ' },
    ]
  },
  {
    name: 'Minimalist',
    parts: [
      { type: 'formatting', label: 'Reset All', value: '0', preview: '' },
      { type: 'color', label: 'Cyan', value: '36', preview: '' },
      { type: 'escape', label: 'Working Dir (short)', value: '\\W', preview: 'current' },
      { type: 'color', label: 'White', value: '37', preview: '' },
      { type: 'special', label: 'Space', value: ' ', preview: ' ' },
      { type: 'text', label: 'Arrow', value: '→', preview: '→' },
      { type: 'special', label: 'Space', value: ' ', preview: ' ' },
    ]
  },
  {
    name: 'Powerline Style',
    parts: [
      { type: 'formatting', label: 'Reset All', value: '0', preview: '' },
      { type: 'color', label: 'Blue', value: '34', preview: '' },
      { type: 'special', label: '[ Bracket', value: '[', preview: '[' },
      { type: 'escape', label: 'Time (24h)', value: '\\t', preview: '14:30:05' },
      { type: 'special', label: '] Bracket', value: ']', preview: ']' },
      { type: 'special', label: 'Space', value: ' ', preview: ' ' },
      { type: 'color', label: 'Green', value: '32', preview: '' },
      { type: 'escape', label: 'Username', value: '\\u', preview: 'user' },
      { type: 'color', label: 'White', value: '37', preview: '' },
      { type: 'special', label: 'Space', value: ' ', preview: ' ' },
      { type: 'text', label: 'Rocket', value: '🚀', preview: '🚀' },
      { type: 'special', label: 'Space', value: ' ', preview: ' ' },
      { type: 'escape', label: 'Prompt Char ($/#)', value: '\\$', preview: '$' },
      { type: 'special', label: 'Space', value: ' ', preview: ' ' },
    ]
  },
  {
    name: 'Two-Line Prompt',
    parts: [
      { type: 'formatting', label: 'Reset All', value: '0', preview: '' },
      { type: 'color', label: 'Purple', value: '35', preview: '' },
      { type: 'text', label: 'Terminal', value: '💻', preview: '💻' },
      { type: 'special', label: 'Space', value: ' ', preview: ' ' },
      { type: 'escape', label: 'Working Dir (full)', value: '\\w', preview: '~/path/to/current' },
      { type: 'escape', label: 'Newline', value: '\\n', preview: '\n' },
      { type: 'color', label: 'Green', value: '32', preview: '' },
      { type: 'text', label: 'Arrow', value: '❯', preview: '❯' },
      { type: 'special', label: 'Space', value: ' ', preview: ' ' },
    ]
  }
];

export const get256ColorHex = (n: number): string => {
  if (n < 16) {
    const standardColors = [
      '#000000', '#800000', '#008000', '#808000', '#000080', '#800080', '#008080', '#c0c0c0',
      '#808080', '#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff', '#00ffff', '#ffffff'
    ];
    return standardColors[n];
  }
  if (n < 232) {
    n -= 16;
    const r = Math.floor(n / 36);
    const g = Math.floor((n % 36) / 6);
    const b = n % 6;
    const toHex = (v: number) => (v === 0 ? '00' : (v * 40 + 55).toString(16).padStart(2, '0'));
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  const v = (n - 232) * 10 + 8;
  const hex = v.toString(16).padStart(2, '0');
  return `#${hex}${hex}${hex}`;
};

export const COLORS_256 = Array.from({ length: 256 }, (_, i) => ({
  n: i,
  hex: get256ColorHex(i)
}));

export const TERMINAL_THEMES: TerminalTheme[] = [
  {
    id: 'konsole-dark',
    name: 'Konsole Dark',
    bg: '#0f172a',
    text: '#f8fafc',
    border: '#1e293b',
    titleBar: '#1a1d20',
    tabBar: '#2d3236',
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    bg: '#002b36',
    text: '#839496',
    border: '#073642',
    titleBar: '#073642',
    tabBar: '#00212b',
  },
  {
    id: 'one-dark',
    name: 'One Dark',
    bg: '#282c34',
    text: '#abb2bf',
    border: '#181a1f',
    titleBar: '#21252b',
    tabBar: '#181a1f',
  },
  {
    id: 'nord',
    name: 'Nord',
    bg: '#2e3440',
    text: '#d8dee9',
    border: '#3b4252',
    titleBar: '#3b4252',
    tabBar: '#2e3440',
  },
  {
    id: 'gruvbox-dark',
    name: 'Gruvbox Dark',
    bg: '#282828',
    text: '#ebdbb2',
    border: '#1d2021',
    titleBar: '#3c3836',
    tabBar: '#1d2021',
  },
  {
    id: 'monokai',
    name: 'Monokai',
    bg: '#272822',
    text: '#f8f8f2',
    border: '#1e1f1c',
    titleBar: '#1e1f1c',
    tabBar: '#272822',
  },
  {
    id: 'light',
    name: 'KDE Light',
    bg: '#ffffff',
    text: '#2e3436',
    border: '#d3d7cf',
    titleBar: '#eeeeec',
    tabBar: '#d3d7cf',
  },
  {
    id: 'solarized-light',
    name: 'Solarized Light',
    bg: '#fdf6e3',
    text: '#657b83',
    border: '#eee8d5',
    titleBar: '#eee8d5',
    tabBar: '#fdf6e3',
  },
  {
    id: 'ayc-dark',
    name: 'Ayc Dark',
    bg: '#0f1419',
    text: '#e6e1cf',
    border: '#151b23',
    titleBar: '#0f1419',
    tabBar: '#151b23',
  },
  {
    id: 'dracula',
    name: 'Dracula',
    bg: '#282a36',
    text: '#f8f8f2',
    border: '#44475a',
    titleBar: '#21222c',
    tabBar: '#282a36',
  },
  {
    id: 'catppuccin',
    name: 'Catppuccin',
    bg: '#1e1e2e',
    text: '#cdd6f4',
    border: '#313244',
    titleBar: '#11111b',
    tabBar: '#181825',
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    bg: '#1a1b26',
    text: '#c0caf5',
    border: '#24283b',
    titleBar: '#16161e',
    tabBar: '#1a1b26',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    bg: '#000b1e',
    text: '#00ff9f',
    border: '#d300c4',
    titleBar: '#000b1e',
    tabBar: '#001a33',
  },
  {
    id: 'retro',
    name: 'Retro Terminal',
    bg: '#000000',
    text: '#33ff33',
    border: '#111111',
    titleBar: '#000000',
    tabBar: '#000000',
  },
];

export const INITIAL_PROMPT: PromptPart[] = [
  { id: '0', type: 'formatting', label: 'Reset All', value: '0', preview: '' },
  { id: '1', type: 'escape', label: 'Username', value: '\\u', preview: 'user' },
  { id: '2', type: 'special', label: '@ Symbol', value: '@', preview: '@' },
  { id: '3', type: 'escape', label: 'Hostname (short)', value: '\\h', preview: 'host' },
  { id: '4', type: 'special', label: 'Space', value: ' ', preview: ' ' },
  { id: '5', type: 'escape', label: 'Working Dir (short)', value: '\\W', preview: 'current' },
  { id: '6', type: 'special', label: 'Space', value: ' ', preview: ' ' },
  { id: '7', type: 'escape', label: 'Prompt Char ($/#)', value: '\\$', preview: '$' },
  { id: '8', type: 'special', label: 'Space', value: ' ', preview: ' ' },
];
