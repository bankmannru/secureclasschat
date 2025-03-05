
export interface AdminPrivileges {
  canManageChannels: boolean;
  canMuteUsers: boolean;
  canBlockClass: boolean;
}

export interface MutedUser {
  userId: string;
  userName: string;
  mutedUntil: Date;
  reason?: string;
}

export interface BlockedClass {
  classId: string;
  blockedUntil: Date;
  reason?: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  groupId: string;
}
