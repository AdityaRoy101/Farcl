export const USER_SIGNUP_MUTATION = `
  mutation UserSignup($email: String!, $password: String!, $name: String!) {
    userSignup(email: $email, password: $password, name: $name)
  }
`;
