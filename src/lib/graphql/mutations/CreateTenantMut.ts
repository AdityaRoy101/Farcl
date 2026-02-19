// src/lib/graphql/mutations/CreateTenantMut.ts
export const CREATE_TENANT_MUTATION = `
  mutation CreateTenant($tenantName: String!, $tenantType: String!) {
    createTenant(tenantName: $tenantName, tenantType: $tenantType)
  }
`;