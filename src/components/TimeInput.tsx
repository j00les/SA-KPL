'use client';

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
}

function formatTimeOnBlur(raw: string): string {
  // Remove everything except digits, colons, and dots
  const cleaned = raw.replace(/[^\d:.]/g, '');

  if (cleaned === '') return '';

  return cleaned;
}

export default function TimeInput({ value, onChange, placeholder = '00:00.000', label }: TimeInputProps) {
  const handleBlur = () => {
    const formatted = formatTimeOnBlur(value);
    if (formatted !== value) {
      onChange(formatted);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
        {label}
      </label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="min-h-12 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base font-mono text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-colors"
      />
    </div>
  );
}
