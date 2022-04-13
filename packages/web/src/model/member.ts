import { MemberStatus } from '@prisma/client';

export function memberStatusLabel(status: MemberStatus): string {
  switch (status) {
    case MemberStatus.Joined:
      return '加入済み';
    case MemberStatus.Kicked:
      return '除名済み';
    case MemberStatus.Leaved:
      return '脱退';
    case MemberStatus.NotJoined:
      return '未加入';
    case MemberStatus.OB:
      return 'OB';
  }
}
