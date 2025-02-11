const ChatCountBadge = ({ count }: { count: number }) => {
  if (count === 0) return;
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-red-700 bg-red-600 text-[10px] text-white shadow-md">
      {count >= 100 ? "99+" : count}
    </span>
  );
};

export default ChatCountBadge;
