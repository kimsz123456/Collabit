const ProgressChart = ({ value, className }: { value: number; className?: string }) => {
  return (
    <div className={`relative h-3 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          background:
            // "linear-gradient(to right, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8f00ff)",
            "linear-gradient(to right, #f87171, #60a5fa",
        }}
      />
      <div
        className="absolute right-0 top-0 h-full bg-gray-200"
        style={{
          width: `${100 - value}%`,
          transition: "width 0.5s ease-in-out",
        }}
      />
    </div>
  );
};

export default ProgressChart;
