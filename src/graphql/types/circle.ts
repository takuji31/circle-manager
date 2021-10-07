import * as Nexus from "nexus-prisma";
import { objectType } from "nexus";
export const Circle = objectType({
  name: Nexus.Circle.$name,
  description: Nexus.Circle.$description,
  definition(t) {
    const c = Nexus.Circle;
    t.field(c.id);
    t.field(c.name);
    t.field(c.createdAt);
    t.field(c.members);
  },
});
