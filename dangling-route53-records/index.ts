import {
  Route53Client,
  ListResourceRecordSetsCommand,
  ResourceRecordSet,
  ListResourceRecordSetsCommandInput,
  ListHostedZonesCommand,
} from "@aws-sdk/client-route-53";
import * as fs from "fs";

const resolverClient = new Route53Client({ region: 'us-west-2' });

const listHostedZones = async (): Promise<string[]> => {
  const command = new ListHostedZonesCommand({});
  const response = await resolverClient.send(command);
  console.log("HostedZones", response.HostedZones);
  return response.HostedZones?.map((zone) => zone.Id ?? "") ?? [];
};

const listResourceRecordSets = async (
  input: ListResourceRecordSetsCommandInput
): Promise<ResourceRecordSet[]> => {
  const command = new ListResourceRecordSetsCommand(input);
  const response = await resolverClient.send(command);
  return response.ResourceRecordSets ?? [];
};

const scanRoute53Records = async () => {
  const hostedZoneIds = await listHostedZones();

  const pingResults: { [key: string]: boolean } = {};

  const outputStream = fs.createWriteStream("route53-scan-results.csv");

  for (const hostedZoneId of hostedZoneIds) {
    const records = await listResourceRecordSets({
      HostedZoneId: hostedZoneId,
    });

    for (const record of records) {
      const recordName = record.Name as string;
      const recordType = record.Type;
      console.log("Record", recordType, recordName);

      if (!recordName)
        continue;
      
      if (recordType !== "A" && recordType !== "CNAME")
        continue;

      const pingResult = await isReachable(recordName ?? "");
      pingResults[recordName] = pingResult;
      outputStream.write(`${hostedZoneId},${recordName},${recordType},${pingResult}\n`);

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log("Ping results:");
  console.table(pingResults);
};

const isReachable = async (hostname: string): Promise<boolean> => {
  try {
    const response = await fetch("https://" + hostname);
    return response.ok;
  } catch (error) {
    return false;
  }
};

scanRoute53Records();  
