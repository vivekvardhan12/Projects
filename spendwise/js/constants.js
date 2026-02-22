/* ============================================================
   js/constants.js
   Global constants: categories, emoji icons, chart colors.
   Loaded first so all other files can reference these.
   ============================================================ */

// Income and expense categories shown in dropdowns
const CATEGORIES = {
  income:  ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other Income'],
  expense: ['Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Shopping', 'Education', 'Utilities', 'Travel', 'Other'],
};

// Emoji icons mapped to each category name
const CAT_ICONS = {
  Salary:         '💼',
  Freelance:      '💻',
  Investment:     '📈',
  Business:       '🏢',
  Gift:           '🎁',
  'Other Income': '💰',
  Food:           '🍔',
  Transport:      '🚗',
  Housing:        '🏠',
  Health:         '💊',
  Entertainment:  '🎬',
  Shopping:       '🛍️',
  Education:      '📚',
  Utilities:      '⚡',
  Travel:         '✈️',
  Other:          '📌',
};

// Colors used for charts (one per category)
const CAT_COLORS = [
  '#7c5cfc', '#fc5c7d', '#2ecc71', '#f39c12', '#3498db',
  '#e74c3c', '#1abc9c', '#9b59b6', '#e67e22', '#34495e',
];