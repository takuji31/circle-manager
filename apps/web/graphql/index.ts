import { makeSchema } from 'nexus';
import NexusPrismaScalars from 'nexus-prisma/scalars';
import { join } from 'path';
import * as types from './types';

export const schema = makeSchema({
  types: [types, NexusPrismaScalars],
  outputs: {
    typegen: join(
      process.cwd(),
      'node_modules',
      '@types',
      'nexus-typegen',
      'index.d.ts'
    ),
    schema: join(process.cwd(), 'apps', 'web', 'graphql', 'schema.graphqls'),
  },
  contextType: {
    export: 'Context',
    module: join(process.cwd(), 'apps', 'web', 'graphql', 'context.ts'),
  },
});
