import { Badge, LiveBadge } from "@/components/ui/badge";
import { daysUntil } from "@/lib/utils";
import type { EventStatus } from "@/lib/data/types";

export function EventStatusBadge({
  status,
  deadline,
  size = "md",
}: {
  status: EventStatus;
  deadline?: string;
  size?: "sm" | "md";
}) {
  switch (status) {
    case "live":
      return <LiveBadge />;
    case "open":
      return (
        <Badge variant="teal" size={size}>
          Registration open
        </Badge>
      );
    case "closing-soon": {
      const days = deadline ? daysUntil(deadline) : null;
      return (
        <Badge variant="warning" size={size}>
          {days != null && days <= 14 ? `Closes in ${days}d` : "Closing soon"}
        </Badge>
      );
    }
    case "upcoming":
      return (
        <Badge variant="ghost" size={size}>
          Opening soon
        </Badge>
      );
    case "closed":
      return (
        <Badge variant="muted" size={size}>
          Closed
        </Badge>
      );
  }
}
