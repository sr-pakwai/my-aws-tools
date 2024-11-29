const AWS = require("aws-sdk");

// Configure AWS
AWS.config.update({ region: "us-east-1" });
const iam = new AWS.IAM();

async function listIAMResources() {
  try {
    console.log("Fetching IAM users...");
    const users = await iam.listUsers().promise();
    for (const user of users.Users) {
      console.log(`\nUser: ${user.UserName}`);
      console.log(`  Created: ${user.CreateDate.toISOString()}`);

      // Tags
      const tags = await iam.listUserTags({ UserName: user.UserName }).promise();
      console.log("  Tags:", tags.Tags.length > 0 ? tags.Tags : "None");

      const accessKeys = await iam.listAccessKeys({ UserName: user.UserName }).promise();
      for (const accessKey of accessKeys.AccessKeyMetadata) {
        const lastUsed = await iam.getAccessKeyLastUsed({ AccessKeyId: accessKey.AccessKeyId }).promise();
        console.log(`  Access key: ${accessKey}`);
        console.log("  Last used service:", lastUsed?.AccessKeyLastUsed?.ServiceName || "Unknown");
        console.log("  Last used date:", lastUsed?.AccessKeyLastUsed?.LastUsedDate || "Unknown");
        console.log("  Last used region:", lastUsed?.AccessKeyLastUsed?.Region || "Unknown");
      }
    }

    console.log("\nFetching IAM roles...");
    const roles = await iam.listRoles().promise();
    for (const role of roles.Roles) {
      console.log(`\nRole: ${role.RoleName}`);
      console.log(`  Created: ${role.CreateDate.toISOString()}`);

      // Tags
      const tags = await iam.listRoleTags({ RoleName: role.RoleName }).promise();
      console.log("  Tags:", tags.Tags.length > 0 ? tags.Tags : "None");

      // // Trusted Entities
      const policy = await iam.getRole({ RoleName: role.RoleName }).promise();
  
      // Last used service
      console.log("  Last used service:", role?.RoleLastUsed?.ServiceName || "Never");
      console.log("  Last used date:", role?.RoleLastUsed?.LastUsedDate || "Never");
      console.log("  Last used region:", role?.RoleLastUsed?.Region || "Never");
    }

    console.log("\nFetching IAM policies...");
    let i = 0;
    const policies = await iam.listPolicies({ Scope: "Local" }).promise();
    for (const policy of policies.Policies) {
      console.log(`\nPolicy: ${policy.PolicyName}`);
      console.log(`  Created: ${policy.CreateDate.toISOString()}`);
      console.log(`  Attachments: ${policy.AttachmentCount}`);

      // Tags
      const tags = await iam.listPolicyTags({ PolicyArn: policy.Arn }).promise();
      console.log("  Tags:", tags.Tags.length > 0 ? tags.Tags : "None");

      // Check if policy is attached
      const attachments = await iam.listEntitiesForPolicy({ PolicyArn: policy.Arn }).promise();
      const isUnused =
        attachments.PolicyGroups.length === 0 &&
        attachments.PolicyUsers.length === 0 &&
        attachments.PolicyRoles.length === 0;
      console.log("  Status:", isUnused ? "Unused" : "In use");
      console.log("    Groups:", attachments.PolicyGroups.map(policy => policy.GroupName));
      console.log("    Users:", attachments.PolicyUsers.map(policy => policy.UserName));
      console.log("    Roles:", attachments.PolicyRoles.map(policy => policy.RoleName));

      if (i++ > 5)
        break;
    }
  } catch (error) {
    console.error("Error fetching IAM data:", error.message);
  }
}

listIAMResources();
