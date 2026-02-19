export const GITHUB_SIGNUP_LOGIN_MUTATION = `
  mutation GithubSignupLogin($code: String!) {
    githubSignupOrLogin(code: $code)
  }
`;
