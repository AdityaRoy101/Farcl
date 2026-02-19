export const REFRESH_TOKEN_MUTATION = `
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken)
  }
`;
