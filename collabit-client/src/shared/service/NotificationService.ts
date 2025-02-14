class NotificationService {
  private static instance: NotificationService;
  private eventSource: EventSource | null = null;
  private subscribers: Set<(data: any) => void> = new Set();

  private constructor() {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new NotificationService();
    }
    return this.instance;
  }

  connect() {
    if (this.eventSource) return;

    this.eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/api/sse/subscribe`,
      {
        withCredentials: true,
      },
    );

    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.subscribers.forEach((callback) => callback(data));
    };
  }

  disconnect() {
    this.eventSource?.close();
    this.eventSource = null;
  }

  subscribe(callback: (data: any) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
}

export const notificationService = NotificationService.getInstance();
