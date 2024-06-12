import { EC2Client, DescribeSecurityGroupsCommand, DescribeNetworkInterfacesCommand } from "@aws-sdk/client-ec2";

const config = { region: "us-west-2" };

module.exports = { RequestSecurityGroupInfo, RequestNetworkInterfaceInfo };

/////////////////////////////////////////////////////////////////////////////////////

async function RequestSecurityGroupInfo(GroupIds) {
  const input = { DryRun: false, GroupIds };

  const client = new EC2Client(config);
  const command = new DescribeSecurityGroupsCommand(input);
  const response = await client.send(command);

  return response;
};

async function RequestNetworkInterfaceInfo(GroupIds) {
  const input = { DryRun: false, Filters: GroupIds.map(id => ({
    'group-id': id,
  })) };
  const client = new EC2Client(config);
  const command = new DescribeNetworkInterfacesCommand(input);
  const response = await client.send(command);

  return response;
}
