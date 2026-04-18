import React from 'react';

/**
 * Alerjen ikonlarını gösterir; native `title` ile hover’da başlık.
 * @param {{ id: number, title: string, icon: string }[]} allergens
 */
export default function AllergenIconRow({ allergens, className = '', iconClassName = 'text-lg leading-none' }) {
  if (!allergens?.length) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 items-center ${className}`}>
      {allergens.map((a) => (
        <span
          key={a.id}
          title={a.title}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-800/90 border border-gray-600/50 text-center cursor-default select-none"
        >
          <span className={iconClassName} aria-hidden>
            {a.icon}
          </span>
        </span>
      ))}
    </div>
  );
}
