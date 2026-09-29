import { requireAdmin } from "@/lib/auth-utils";
import { ChatSessionsManager } from "@/components/admin/chat-sessions-manager";

export const metadata = {
  title: "Chat Sessions — Webgent Admin",
};

export default async function AdminChatPage() {
  await requireAdmin();

  return (
    <div className="animate-in fade-in duration-300">
      <ChatSessionsManager />
    </div>
  );
}
