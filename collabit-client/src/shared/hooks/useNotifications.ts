import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { notificationService } from "../service/NotificationService";

export const useNotifications = () => {
  // 1. 로컬 상태 관리
  const [notifications, setNotifications] = useState<any[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    // 2. 알림 서비스 구독
    const unsubscribe = notificationService.subscribe((data) => {
      // 3. 새 알림이 오면 로컬 상태 업데이트
      setNotifications((prev) => [...prev, data]);

      // 4. 서버 상태(캐시) 무효화
      // queryClient.invalidateQueries(['notifications']);
    });

    // 5. 클린업 함수
    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  return { notifications };
};
