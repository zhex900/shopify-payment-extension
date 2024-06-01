const GITHUB_DEPLOYMENT_ROLE_NAME = "github-deployment-role";
const GITHUB_DOMAIN = "token.actions.githubusercontent.com";

const repositoryConfig = [
  {
    owner: "zhex900",
    repo: "shopify-payment-extension",
  },
];

const ghProvider = new aws.iam.OpenIdConnectProvider("GithubProvider", {
  url: `https://${GITHUB_DOMAIN}`,
  clientIdLists: ["sts.amazonaws.com"],
  //https://github.blog/changelog/2023-06-27-github-actions-update-on-oidc-integration-with-aws/
  thumbprintLists: [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd",
  ],
});

const iamRepoDeployAccess = repositoryConfig.map(
  (r) => `repo:${r.owner}/${r.repo}:*`,
);

// grant only requests coming from a specific GitHub repository.
const conditions: aws.iam.Conditions = {
  StringLike: {
    [`${GITHUB_DOMAIN}:sub`]: iamRepoDeployAccess,
  },
};

// Create the IAM Role
export const githubDeployRole = new aws.iam.Role("GitHubDeployRole", {
  assumeRolePolicy: {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: {
          Federated: ghProvider.arn, // You need to define or import `ghProvider`
        },
        Action: "sts:AssumeRoleWithWebIdentity",
        Condition: conditions,
      },
    ],
  },
  managedPolicyArns: ["arn:aws:iam::aws:policy/AdministratorAccess"],
  name: GITHUB_DEPLOYMENT_ROLE_NAME, // You need to define or import `GITHUB_DEPLOYMENT_ROLE_NAME`
  description:
    "This role is used via GitHub Actions to deploy with AWS CDK on the target AWS account",
  maxSessionDuration: 3600, // 1 hour in seconds
});
