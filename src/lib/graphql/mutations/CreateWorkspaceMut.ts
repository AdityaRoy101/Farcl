export const CREATE_WORKSPACE_MUTATION = `
  mutation CreateWorkspace($workspaceName: String!) {
    createWorkspace(workspaceName: $workspaceName)
  }
`;