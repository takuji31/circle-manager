import { objectType } from 'nexus';
import * as Nexus from 'nexus-prisma';

const m = Nexus.UmastagramMemberFanCount;

export const MemberFanCount = objectType({
  name: m.$name,
  description: m.$description,
  definition(t) {
    t.field(m.id);
    t.field(m.name);
    t.field(m.member);
    t.field(m.circle);
    t.field(m.total);
    t.field(m.avg);
    t.field(m.predicted);
  },
});
