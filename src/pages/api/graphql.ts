import { ApolloServer } from 'apollo-server-micro';
import { createContext } from '../../graphql/context';
import Cors from 'micro-cors';
import { schema } from '../../graphql';

const server = new ApolloServer({
  schema,
  context: createContext,
});

const cors = Cors();

const startServer = server.start();

export default cors(async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.end();
    return false;
  }
  await startServer;

  await server.createHandler({
    path: '/api/graphql',
  })(req, res);
});

export const config = {
  api: {
    bodyParser: false,
  },
};
