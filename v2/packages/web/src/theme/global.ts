import { mode, Styles } from '@chakra-ui/theme-tools';

export const styles: Styles = {
  global: (props) => ({
    body: {
      fontFamily: 'body',
      color: mode('black', 'white')(props),
      bg: mode('white', 'blackAlpha.900')(props),
      lineHeight: 'base',
    },
    '*::placeholder': {
      color: mode('gray.400', 'whiteAlpha.400')(props),
    },
    '*, *::before, &::after': {
      borderColor: mode('gray.200', 'whiteAlpha.300')(props),
      wordWrap: 'break-word',
    },
  }),
};
