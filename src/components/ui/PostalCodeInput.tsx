import React, { useEffect, useState } from "react";
import { getPostalCodeInfo, validatePostalCode, formatPostalCode } from "@/utils/postalCode";

interface PostalCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  countryCode: string;
  error?: string;
  className?: string;
  required?: boolean;
}

export function PostalCodeInput({
  value,
  onChange,
  countryCode,
  error,
  className = "",
  required = false,
}: PostalCodeInputProps) {
  const [postalInfo, setPostalInfo] = useState(getPostalCodeInfo(countryCode));
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setPostalInfo(getPostalCodeInfo(countryCode));
  }, [countryCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleBlur = () => {
    // Format the postal code on blur
    const formatted = formatPostalCode(localValue, countryCode);
    if (formatted !== localValue) {
      setLocalValue(formatted);
      onChange(formatted);
    }
  };

  const isValid = validatePostalCode(localValue, countryCode);
  const showError = error || (!isValid && localValue && "Invalid format");

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {postalInfo.label}{" "}
        {!required && (
          <span className="text-sm font-normal text-neutral-500">
            (Optional)
          </span>
        )}
      </label>
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`input ${showError ? "border-red-500" : ""} ${className}`}
        placeholder={postalInfo.placeholder}
        maxLength={postalInfo.maxLength}
      />
      {showError && (
        <p className="text-red-500 text-sm mt-1">{showError}</p>
      )}
      {!showError && localValue && postalInfo.pattern && (
        <p className="text-green-600 text-sm mt-1">✓ Valid format</p>
      )}
    </div>
  );
}
