import { useState } from 'react'
import { gql } from '@apollo/client'
import { useMutation, useApolloClient } from '@apollo/client/react'

const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password)
  }
`
const REGISTER = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    register(username: $username, email: $email, password: $password)
  }
`

export default function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false)
  const client = useApolloClient()
  const [submit, { loading, error, reset }] = useMutation(isRegistering ? REGISTER : LOGIN)

  async function handleSubmit(event) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const variables = { username: fields.get('username').trim(), password: fields.get('password') }
    if (isRegistering) variables.email = fields.get('email').trim()
    try {
      const { data } = await submit({ variables })
      await client.clearStore()
      localStorage.setItem('token', isRegistering ? data.register : data.login)
      onLogin()
    } catch { /* Show the mutation error in the form. */ }
  }
  return (
    <main className="auth-page">
      <section className="auth-card">
        <a className="wordmark auth-wordmark" href="#" aria-label="AniLog home">
          AniLog
        </a>
        <div className="modal-kicker">Your stories, remembered</div>
        <h1>{isRegistering ? "Create your account" : "Welcome back"}</h1>
        <p>
          {isRegistering
            ? "Start a collection for everything you watch and read."
            : "Sign in to pick up where you left off."}
        </p>
        <form onSubmit={handleSubmit}>
          <label>
            <span>Username</span>
            <input name="username" autoComplete="username" required />
          </label>
          {isRegistering && (
            <label>
              <span>Email</span>
              <input name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
            </label>
          )}
          <label>
            <span>Password</span>
            <input name="password" type="password" autoComplete={isRegistering ? "new-password" : "current-password"} required />
          </label>
          {error && <p className="error" role="alert">{error.message}</p>}
          <button className="primary-button auth-submit" type="submit" disabled={loading}>
            {isRegistering ? "Create account" : "Sign in"}
          </button>
        </form>
        <div className="auth-switch">
          {isRegistering ? "Already have an account?" : "New to AniLog?"}
          <button disabled={loading} onClick={() => { reset(); setIsRegistering(!isRegistering) }}>
            {isRegistering ? "Sign in" : "Create one"}
          </button>
        </div>
      </section>
    </main>
  );
}