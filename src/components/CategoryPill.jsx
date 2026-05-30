// src/components/CategoryPill.jsx
'use client';
import { CATEGORY_META } from '@/lib/activityConfig';

export default function CategoryPill({ category }) {
  const meta = CATEGORY_META[category] || CATEGORY_META['Other / Custom'];
  return (
    <span className="cat-pill" style={{ backgroundColor: meta.color }}>
      <span className="cat-pill-icon">{meta.icon}</span>
      <span className="cat-pill-text">{category}</span>
    </span>
  );
}
