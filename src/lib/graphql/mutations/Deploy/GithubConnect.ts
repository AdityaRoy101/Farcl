export const IS_GITHUB_CONNECTED_MUTATION = `
  mutation IsGithubConnected {
    isGithubConnected
  }
`;

export const ADD_GITHUB_PROVIDER_MUTATION = `
  mutation AddGithubProvider($code: String!) {
    addGithubProvider(code: $code)
  }
`;