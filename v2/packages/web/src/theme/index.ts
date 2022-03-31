import { extendTheme, type ThemeConfig } from '@chakra-ui/react';
import { styles } from './global';

// 2. Add your color mode config
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
};

// 3. extend the theme
const theme = extendTheme({ config, styles });

export default theme;
