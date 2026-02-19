export const USER_LOGIN_MUTATION = `
  mutation UserLogin($email: String!, $password: String!) {
    userLogin(email: $email, password: $password)
  }
`;
