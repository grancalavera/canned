import { Octokit } from "@octokit/rest";

// this is not secure
// see: https://create-react-app.dev/docs/adding-custom-environment-variables/
export const octokitClient = new Octokit({ auth: process.env.REACT_APP_GITHUB_TOKEN });
