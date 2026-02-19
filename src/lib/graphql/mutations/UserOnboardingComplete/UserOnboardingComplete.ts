export const USER_ONBOARDING_COMPLETE_MUTATION = `
  mutation UserOnboardingComplete($tenantName: String!, $tenantType: String!) {
    userOnboardingComplete(tenantName: $tenantName, tenantType: $tenantType)
  }
`;
