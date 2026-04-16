import { generateUI } from '@/agents/uiGenerator';

// Simulated Tool Layer functions
// These don't need 'use server' if called from API route, but we keep them clean.

/**
 * Tool: generateComponentTree
 * Simulates Agent making a tool call to generate the UI based on structured data.
 */
export async function generateComponentTree(structuredJson: any): Promise<string> {
  console.log("TOOL CALLED: generateComponentTree with payload:", structuredJson);
  // Execute the UI generator agent
  const code = await generateUI(structuredJson);
  return code;
}

/**
 * Tool: previewUI
 * Simulates an action to format/prepare the code for preview.
 * This is largely a pass-through in server code but represents the tool call concept.
 */
export function previewUI(code: string): { status: string, readyForPreview: boolean } {
  console.log("TOOL CALLED: previewUI");
  if (!code) {
    throw new Error("No code provided to preview");
  }
  return { status: "Ready", readyForPreview: true };
}

/**
 * Tool: exportCode
 * Simulates an action to package the code.
 */
export function exportCode(code: string): { status: string, readyForExport: boolean } {
  console.log("TOOL CALLED: exportCode");
  if (!code) {
    throw new Error("No code provided to export");
  }
  return { status: "Ready", readyForExport: true };
}
