const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();

  // 년, 월, 일이 같은지 확인 (24시간 기준 대신 날짜 기준으로 확인)
  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (isSameDay) return "오늘";
  if (diffDays === 0) return "어제";
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
  return `${Math.floor(diffDays / 365)}년 전`;
};

export default formatRelativeTime;
