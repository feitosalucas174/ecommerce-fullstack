import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          rounded-xl border px-3.5 py-2.5 text-sm shadow-sm transition-all
          bg-white dark:bg-gray-700/50
          text-gray-900 dark:text-gray-100
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-blue-500/30 focus:border-gray-400 dark:focus:border-gray-500
          disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
          ${error
            ? "border-red-400 focus:border-red-400 focus:ring-red-100"
            : "border-gray-200 dark:border-gray-600"
          }
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
