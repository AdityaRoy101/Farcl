export const GOOGLE_SIGNUP_LOGIN_MUTATION = `
  mutation GoogleSignupLogin($idToken: String!) {
    googleSignupOrLogin(idToken: $idToken)
  }
`;
