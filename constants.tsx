import React from 'react';
import { 
  Car, 
  Utensils, 
  Beer, 
  Leaf, 
  ShoppingBag, 
  Ticket, 
  MoreHorizontal 
} from 'lucide-react';
import { Category } from './types';

export const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  [Category.Transport]: <Car size={20} />,
  [Category.Food]: <Utensils size={20} />,
  [Category.Drink]: <Beer size={20} />,
  [Category.Weed]: <Leaf size={20} />,
  [Category.Purchase]: <ShoppingBag size={20} />,
  [Category.Play]: <Ticket size={20} />,
  [Category.Other]: <MoreHorizontal size={20} />,
};

export const DEFAULT_EXCHANGE_RATE = 0.24; // Updated to approx current rate

// Matrix/Cyber Palette
export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.Transport]: '#3b82f6', // Cyber Blue
  [Category.Food]: '#eab308',      // Yellow
  [Category.Drink]: '#ef4444',     // Red
  [Category.Weed]: '#00ff41',      // Matrix Neon Green
  [Category.Purchase]: '#d946ef',  // Neon Purple
  [Category.Play]: '#f97316',      // Orange
  [Category.Other]: '#94a3b8',     // Slate
};