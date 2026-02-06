'use client';

import { useState } from 'react';

interface AddDriverInlineProps {
  onAdd: (name: string) => void;
}

export default function AddDriverInline({ onAdd }: AddDriverInlineProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName('');
    setIsOpen(false);
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex h-12 w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 text-sm font-medium text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
        </svg>
        Add Driver
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        autoFocus
        placeholder="Driver name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') {
            setName('');
            setIsOpen(false);
          }
        }}
        className="h-12 flex-1 rounded-md border border-gray-200 bg-white px-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
      />
      <button
        type="button"
        onClick={handleSubmit}
        className="h-12 rounded-md bg-gray-800 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-700 active:bg-gray-900"
      >
        Add
      </button>
      <button
        type="button"
        onClick={() => {
          setName('');
          setIsOpen(false);
        }}
        className="flex h-12 w-12 items-center justify-center rounded-md text-gray-400 transition-colors hover:text-gray-600"
        aria-label="Cancel"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  );
}
