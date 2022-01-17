import { Kind } from 'graphql';
import { scalarType } from 'nexus';
import { Temporal } from 'proposal-temporal';

export const DateScalar = scalarType({
  name: 'Date',
  asNexusMethod: 'date',
  description: 'ISO8601 Date string',
  parseValue(value: string) {
    return Temporal.PlainDate.from(value);
  },
  serialize(value: Temporal.PlainDate) {
    return value.toString();
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return Temporal.PlainDate.from(ast.value);
    }
    return null;
  },
});
