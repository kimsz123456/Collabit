const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();

  const diffTime = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // 날짜 및 시간 포맷 (HH:mm)
  const formatTime = (date: Date) => {
    return date.toTimeString().slice(0, 5); // "HH:mm" 형태로 변환
  };

  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffDays === 0) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}달 전`;
  return `${Math.floor(diffDays / 365)}년 전`;
};

export default formatRelativeTime;
