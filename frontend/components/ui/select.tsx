import { useState, Dispatch, SetStateAction } from 'react';
import React from 'react';

interface SelectProps {
  children: React.ReactNode;
  name?: string;
  value?: string;
  onValueChange?: Dispatch<SetStateAction<string>>;
}

interface SelectTriggerProps {
  children: React.ReactNode;
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
}

export const Select: React.FC<SelectProps> = ({ children, name, value }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <input type="hidden" name={name} value={selectedValue || ''} />
      {React.Children.map(children, (child) =>
        React.cloneElement(child as React.ReactElement, { isOpen, setIsOpen, selectedValue, handleSelect })
      )}
    </div>
  );
};

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, isOpen, setIsOpen }) => {
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

export const SelectContent: React.FC<SelectContentProps> = ({ children, isOpen }) => {
  return isOpen ? (
    <ul className="absolute z-10 mt-1 bg-white border border-gray-300 rounded shadow-lg w-full">
      {children}
    </ul>
  ) : null;
};

export const SelectItem: React.FC<SelectItemProps> = ({ value, children, handleSelect }) => {
  return (
    <li
      className="p-2 hover:bg-gray-100 cursor-pointer"
      onClick={() => handleSelect(value)}
    >
      {children}
    </li>
  );
};

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder, selectedValue }) => {
  return (
    <span className="text-gray-700">
      {selectedValue ? selectedValue : placeholder}
    </span>
  );
};
