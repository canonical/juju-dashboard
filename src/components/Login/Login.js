import React from 'react'

import Layout from "components/Layout/Layout";

export default function Login() {
  return (
    <Layout sidebar={false}>
      <h1>Login</h1>
      <p>Please log in to view and manage your models.</p>
      <button className="p-button--positive">Log in</button>
    </Layout>
  )
}
