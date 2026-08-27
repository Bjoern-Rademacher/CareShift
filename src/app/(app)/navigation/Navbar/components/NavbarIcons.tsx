import { Bell, ChevronDown, MessageSquare } from "lucide-react";

export function MessageIcon() {
  return (
    <MessageSquare aria-hidden="true" className="size-5" strokeWidth={1.8} />
  );
}

export function NotificationIcon() {
  return <Bell aria-hidden="true" className="size-5" strokeWidth={1.8} />;
}

export function ChevronIcon() {
  return (
    <ChevronDown
      aria-hidden="true"
      className="size-4 shrink-0 text-foreground-subtle transition-transform group-open:rotate-180"
      strokeWidth={2}
    />
  );
}
