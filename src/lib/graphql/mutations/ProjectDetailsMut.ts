export const PROJECT_DETAILS_MUTATION = `
  mutation ProjectDetails($wid: String!, $pid: String!) {
    projectDetails(wid: $wid, pid: $pid)
  }
`;
