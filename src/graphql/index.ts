import { makeSchema } from 'nexus';
import NexusPrismaScalars from 'nexus-prisma/scalars';
import { join } from 'path';
import * as types from './types';
import * as fields from './fields';
import * as mutations from './mutations';

export const schema = makeSchema({
  types: [types, fields, mutations, NexusPrismaScalars],
  outputs: {
    typegen: join(
      process.cwd(),
      'node_modules',
      '@types',
      'nexus-typegen',
      'index.d.ts'
    ),
    schema: join(process.cwd(), 'graphql', 'schema.graphqls'),
  },
  contextType: {
    export: 'Context',
    module: join(process.cwd(), 'src', 'graphql', 'context.ts'),
  },
  shouldExitAfterGenerateArtifacts: process.argv.includes('--nexusTypegen'),
});
