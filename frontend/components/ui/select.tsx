import { useState, Dispatch, SetStateAction } from "react";
import React from "react";

interface SelectProps {
  children: React.ReactNode;
  name?: string;
  value?: string | undefined;
  setValue?: Dispatch<SetStateAction<string | undefined>>;
  onValueChange?: (year: string) => void;
  // onValueChange?: Dispatch<SetStateAction<string>>;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

interface SelectContentProps {
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

interface SelectValueProps {
  placeholder: string;
  selectedValue: string;
}

export const Select: React.FC<SelectProps> = ({
  children,
  name,
  onValueChange,
  value,
  setValue,
}) => {
  const [selectedValue, setSelectedValue] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue ? setValue(e.target.value) : setSelectedValue(e.target.value);
    onValueChange ? onValueChange(e.target.value) : null;
  };

  return (
    <div className="relative">
      <select
        name={name}
        value={value || selectedValue}
        onChange={handleChange}
        className="border border-gray-300 rounded p-2 w-full text-left"
      >
        {children}
      </select>
    </div>
  );
};

export const SelectTrigger: React.FC<SelectTriggerProps> = ({
  children,
  isOpen,
  setIsOpen,
}) => {
  return (
    <button
      type="button"
      className="border border-gray-300 rounded p-2 w-full text-left"
      onClick={() => setIsOpen(!isOpen)}
    >
      {children}
    </button>
  );
};

export const SelectContent: React.FC<SelectContentProps> = ({ children }) => {
  return (
    <select className="border border-gray-300 rounded p-2 w-full text-left">
      {children}
    </select>
  );
};

export const SelectItem: React.FC<SelectItemProps> = ({ value, children }) => {
  return (
    <option className="text-gray-700" value={value}>
      {children}
    </option>
  );
};

export const SelectValue: React.FC<SelectValueProps> = ({
  placeholder,
  selectedValue,
}) => {
  return (
    <span className="text-gray-700">
      {selectedValue ? selectedValue : placeholder}
    </span>
  );
};
