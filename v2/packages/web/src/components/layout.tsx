import {
  Box,
  Button,
  Heading,
  HStack,
  Link,
  Spacer,
  Stack,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';

const NavLink: React.FC = ({ children }) => (
  <Link
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    href={'#'}
  >
    {children}
  </Link>
);

const Layout: React.FC<{ title?: string }> = ({
  children,
  title = 'ウマ娘愛好会',
}) => {
  const { toggleColorMode } = useColorMode();
  const appBarBackground = useColorModeValue('white', 'whiteAlpha.50');
  const appBarShadow = useColorModeValue('md', undefined);
  return (
    <Box>
      <Stack
        p={2}
        shadow={appBarShadow}
        bg={appBarBackground}
        direction="row"
        align="center"
      >
        <Box p="2">
          <Heading size="md">{title}</Heading>
        </Box>
        <Spacer />
        <HStack spacing={2}>
          <Button colorScheme="teal" variant="link" p={2}>
            Log in
          </Button>
          <Button
            colorScheme="teal"
            onClick={toggleColorMode}
            variant="link"
            p={2}
          >
            Toggle color mode
          </Button>
        </HStack>
      </Stack>
      {children}
    </Box>
  );
};

export default Layout;
