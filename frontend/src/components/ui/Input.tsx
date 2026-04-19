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
        <label htmlFor={inputId} className="text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          rounded-xl border px-3.5 py-2.5 text-sm shadow-sm transition-all
          placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400
          disabled:bg-gray-50 disabled:cursor-not-allowed
          ${error ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-200"}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
