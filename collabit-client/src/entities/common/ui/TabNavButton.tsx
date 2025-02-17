"use client";
import { cn } from "@/shared/lib/shadcn/utils";
import { useNotificationStore } from "@/shared/lib/stores/NotificationStore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShallow } from "zustand/shallow";

const TabNavButton = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) => {
  const pathname = usePathname();
  const { surveyRequests, chatRequests } = useNotificationStore(
    useShallow((state) => ({
      surveyRequests: state.surveyRequests,
      surveyResponses: state.surveyResponses,
      chatRequests: state.chatRequests,
    })),
  );

  return (
    <div className="relative">
      <Link
        href={href}
        className={cn(
          "text-lg font-bold",
          pathname.includes(href) && "border-b-2 border-violet-500",
        )}
      >
        {children}
      </Link>
      {((href === "/chat" && chatRequests.length > 0) ||
        (href === "/survey" && surveyRequests.length > 0)) && (
        <div className="absolute -right-2 -top-1 h-2 w-2 rounded-full bg-violet-500" />
      )}
    </div>
  );
};
export default TabNavButton;
