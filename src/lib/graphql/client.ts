import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
} from "@apollo/client";
import Cookies from "js-cookie";

// 1. Use HttpLink (NOT createHttpLink)
const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL,
});

// 2. Auth middleware using ApolloLink (Modern way)
const authLink = new ApolloLink((operation, forward) => {
  const token = Cookies.get("access_token");

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  }));

  return forward(operation);
});

// 3. Combine links safely
const link = ApolloLink.from([authLink, httpLink]);

// 4. Create Apollo Client
export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
