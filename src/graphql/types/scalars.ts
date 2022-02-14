import dayjs from 'dayjs';
import { Kind } from 'graphql';
import { scalarType } from 'nexus';
import { setupDayjs } from '../../model/date';

setupDayjs();

export const DateScalar = scalarType({
  name: 'Date',
  asNexusMethod: 'date',
  description: 'ISO8601 Date string',
  sourceType: {
    module: 'dayjs',
    export: 'Dayjs',
  },
  parseValue(inputValue) {
    return dayjs(inputValue as string);
  },
  serialize(outputValue) {
    return (outputValue as dayjs.Dayjs).toJSON();
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return dayjs(ast.value);
    }
    return null;
  },
});
