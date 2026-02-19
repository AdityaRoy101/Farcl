export const CREATE_PROJECT_MUTATION = `
  mutation CreateProject($wid: String!, $projectName: String!, $projectType: String!) {
    createProject(wid: $wid, projectName: $projectName, projectType: $projectType)
  }
`;