/**
 * Centralized theme configuration for the application.
 * Contains color palettes for charts, status indicators, and other UI elements.
 */

/**
 * Centralized color configuration for the application.
 * Defines chart palettes and status colors to ensure design consistency.
 */
export const CHART_COLORS = {
    // Semantic colors
    success: '#22c55e', // Green-500
    danger: '#ef4444',  // Red-500
    warning: '#f59e0b', // Amber-500
    info: '#3b82f6',    // Blue-500

    // Palette for categorical data (e.g. pie charts)
    palette: [
        '#22c55e', // Green
        '#ef4444', // Red
        '#f59e0b', // Amber
        '#3b82f6', // Blue
        '#8b5cf6', // Violet
        '#ec4899', // Pink
        '#06b6d4'  // Cyan
    ],

    // Specific charts
    plantHealth: {
        healthy: '#22c55e',
        sick: '#ef4444',
        issues: '#f59e0b',
        dead: '#64748b' // Slate-500
    }
};
