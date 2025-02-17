type NotificationEvent = {
  type: "newSurveyRequest" | "newSurveyResponse";
  data: number[];
};

class NotificationService {
  private static instance: NotificationService;
  private eventSource: EventSource | null = null;
  private subscribers: Set<(event: NotificationEvent) => void> = new Set();
  private connectionStatus: "connected" | "disconnected" | "connecting" =
    "disconnected";

  private constructor() {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new NotificationService();
    }
    return this.instance;
  }
  getConnectionStatus() {
    return this.connectionStatus;
  }

  async connect() {
    if (this.eventSource?.readyState === EventSource.OPEN) {
      this.connectionStatus = "connected";
      return;
    }

    this.connectionStatus = "connecting";
    // console.log("SSE 연결 시도 중...");

    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/sse/subscribe`,
      {
        withCredentials: true,
      },
    );

    // EventSource 인스턴스 생성 확인
    // console.log("EventSource 인스턴스 생성됨:", this.eventSource);

    this.eventSource.onopen = async () => {
      this.connectionStatus = "connected";
      // console.log("SSE 연결 성공");
      // console.log("EventSource readyState:", this.eventSource?.readyState);

      try {
        await this.getInitialNotifications();
      } catch (error) {
        console.error("초기 알림 요청 실패:", error);
      }
    };

    this.eventSource.onmessage = (event) => {
      // console.log("onmessage 핸들러 호출됨");
      // console.log("원본 SSE 이벤트 데이터:", event.data);
      try {
        const notification = JSON.parse(event.data) as NotificationEvent;
        // console.log("파싱된 알림 데이터:", notification);
        // console.log("현재 구독자 수:", this.subscribers.size);
        this.subscribers.forEach((callback) => {
          // console.log("구독자 콜백 실행");
          callback(notification);
        });
      } catch (error) {
        console.error("이벤트 데이터 파싱 또는 처리 중 오류:", error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error("SSE 연결 에러:", error);
      this.connectionStatus = "disconnected";
      this.reconnect();
    };
  }

  private async getInitialNotifications() {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/sse/notification`,
      {
        credentials: "include",
      },
    );
    if (!response.ok) {
      throw new Error("기존 알림 요청 실패");
    }
    // console.log("기존 알림 요청 성공");
  }

  private reconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    // 3초 후 재연결 시도
    setTimeout(() => this.connect(), 3000);
  }

  disconnect() {
    this.eventSource?.close();
    this.eventSource = null;
    this.connectionStatus = "disconnected";
    // console.log("SSE 연결 종료");
  }

  subscribe(callback: (event: NotificationEvent) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
}

export const notificationService = NotificationService.getInstance();
