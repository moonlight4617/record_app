import { useState } from 'react';
import React from 'react';

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
}

export const Tabs: React.FC<TabsProps> = ({ defaultValue, children, className }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <div className={`${className}`}>
      {children &&
        React.Children.map(children, (child) =>
          React.cloneElement(child as React.ReactElement, { activeTab, setActiveTab })
        )}
    </div>
  );
};

export const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  return <div className={`flex space-x-4 ${className}`}>{children}</div>;
};

export const TabsTrigger: React.FC<{ value: string, children: React.ReactNode, className: string }> = ({ value, children, className }) => {
  return <button className={`${className}`}>{children}</button>;
};

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, activeTab }) => {
  return activeTab === value ? <div>{children}</div> : null;
};
