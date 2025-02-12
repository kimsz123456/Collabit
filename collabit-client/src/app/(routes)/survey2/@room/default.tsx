const DefaultChatRoomPage = () => {
  return (
    <div className="flex h-[calc(100vh-104px)] w-full flex-col gap-3 px-2 py-4">
      <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-4 rounded-lg bg-white px-4 py-3">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-gray-100 p-6">
            <svg
              className="h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">
            채팅을 시작해보세요
          </h2>
          <p className="text-center text-gray-500">
            왼쪽 채팅방 목록에서 대화할 상대를 선택하거나,
            <br />
            새로운 대화를 시작해보세요.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DefaultChatRoomPage;
