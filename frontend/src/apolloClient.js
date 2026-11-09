import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql'
})

const authLink = new SetContextLink((prevContext) => ({
  headers: {
    ...prevContext.headers,
    authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  },
}))

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
})

export default client