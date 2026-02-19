// src/lib/graphql/mutations/SwitchTenantsMut.ts
export const SWITCH_TENANTS_MUTATION = `
  mutation SwitchTenants($tid: String!) {
    switchTenants(tid: $tid)
  }
`;