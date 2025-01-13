interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg p-4 ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children }) => (
  <div className="mb-4">{children}</div>
);

export const CardTitle: React.FC<CardProps> = ({ className, children }) => (
  <h2 className={`text-xl font-bold text-center ${className}`}>{children}</h2>
);

export const CardDescription: React.FC<CardProps> = ({ children }) => (
  <p className="text-gray-500 text-sm">{children}</p>
);

export const CardContent: React.FC<CardProps> = ({ children }) => (
  <div>{children}</div>
);

export const CardFooter: React.FC<CardProps> = ({ children }) => (
  <div className="mt-4">{children}</div>
);
