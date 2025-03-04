
import { ChevronDown, Hash, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Channel = {
  id: string;
  name: string;
  isPrivate: boolean;
  unreadCount?: number;
};

type ChannelGroup = {
  id: string;
  name: string;
  channels: Channel[];
};

interface ChannelListProps {
  groups: ChannelGroup[];
  activeChannelId: string;
  onSelectChannel: (channelId: string) => void;
}

const ChannelList = ({ groups, activeChannelId, onSelectChannel }: ChannelListProps) => {
  return (
    <div className="space-y-4 py-2">
      {groups.map((group) => (
        <div key={group.id} className="px-2">
          <div className="flex items-center justify-between mb-1 px-2">
            <div className="flex items-center gap-1 text-xs font-medium uppercase text-muted-foreground">
              <ChevronDown className="h-3.5 w-3.5" />
              <span>{group.name}</span>
            </div>
          </div>
          <div className="space-y-[2px]">
            {group.channels.map((channel) => (
              <button
                key={channel.id}
                className={cn(
                  "w-full flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm",
                  "hover:bg-accent hover:text-accent-foreground transition-colors",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  activeChannelId === channel.id && "bg-accent text-accent-foreground font-medium"
                )}
                onClick={() => onSelectChannel(channel.id)}
              >
                <span className="flex-shrink-0 w-5 text-muted-foreground">
                  {channel.isPrivate ? (
                    <LockKeyhole className="h-4 w-4" />
                  ) : (
                    <Hash className="h-4 w-4" />
                  )}
                </span>
                <span className="truncate">{channel.name}</span>
                {channel.unreadCount ? (
                  <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center">
                    {channel.unreadCount}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChannelList;
