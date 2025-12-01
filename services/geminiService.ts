// This service is disabled for the offline version of the app.
// No API keys or external libraries are required.

import { Category } from '../types';

interface ScannedReceiptData {
  amountTHB: number;
  category: Category;
  description: string;
}

export const scanReceipt = async (base64Image: string): Promise<ScannedReceiptData | null> => {
  console.warn("Scan feature is disabled in offline mode.");
  return null;
};