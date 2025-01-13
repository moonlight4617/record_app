import { Dispatch, SetStateAction, useState } from "react";
import React from "react";

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  activeTab?: string;
  isActive?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  children,
  className,
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <div className={`${className}`}>
      {children &&
        React.Children.map(children, (child) =>
          React.cloneElement(child as React.ReactElement, {
            activeTab,
            setActiveTab,
          })
        )}
    </div>
  );
};

export const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  return (
    <div className={`flex space-x-4 ${className} bg-gray-200`}>{children}</div>
  );
};

export const TabsTrigger: React.FC<{
  value: string;
  children: React.ReactNode;
  className?: string;
  setTab?: Dispatch<SetStateAction<string>>;
}> = ({ value, children, className, setTab }) => {
  const handleClickTab = () => {
    setTab ? setTab(value) : null;
  };

  return (
    <button className={`${className} `} onClick={() => handleClickTab()}>
      {children}
    </button>
  );
};

export const TabsContent: React.FC<TabsContentProps> = ({
  children,
  isActive,
}) => {
  // return activeTab === value ? <div>{children}</div> : null;
  return isActive ? <div>{children}</div> : null;
};
