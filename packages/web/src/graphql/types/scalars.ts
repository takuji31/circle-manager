import { LocalDate } from 'model';
import { Kind } from 'graphql';
import { scalarType } from 'nexus';

export const DateScalar = scalarType({
  name: 'Date',
  asNexusMethod: 'date',
  description: 'ISO8601 Date string',
  sourceType: {
    module: '@js-joda/core',
    export: 'LocalDate',
  },
  parseValue(inputValue) {
    return LocalDate.parse(inputValue as string);
  },
  serialize(outputValue) {
    return (outputValue as LocalDate).toString();
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return LocalDate.parse(ast.value);
    }
    return null;
  },
});
