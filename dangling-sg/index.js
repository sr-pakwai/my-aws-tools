import aws from './aws-utils';
import csv from './csv-utils';

(async function start() {
  // const AWSAccount = '527728718473'; // labs
  // const AWSAccount = '180865163268'; // apps
  // const AWSAccount = '684525415334'; // staging
  const AWSAccount = '152777536763'; // Engineering
  const sourceFile = 'CIS.4.1 2021-06-08T11_44_04+08_00 - CIS.4.1 2021-06-08T11_44_04+08_00.csv';

  let CSVData = await csv.readCsvFile(sourceFile);

  const ResultFilterByAccount = CSVData.filter(row => AWSAccount === row['Resource/Security Group'].split(':')[4]);
  const GroupIds = ResultFilterByAccount.map(row => row['Resource/Security Group'].split('/')[1]);
  
  // const SecurityGroupInfo = require('./resp-sg.js');
  const SecurityGroupInfo = await aws.RequestSecurityGroupInfo(GroupIds);
  // const NetworkInterfacesInfo = require('./resp-ni.json');
  const NetworkInterfacesInfo = await aws.RequestNetworkInterfaceInfo(GroupIds);

  const SecurityGroups = SecurityGroupInfo.SecurityGroups;
  const NetworkInterfaces = NetworkInterfacesInfo.NetworkInterfaces;

  SecurityGroups.map(SecurityGroup => {
    const GroupId = SecurityGroup.GroupId;
    const ConnectedNetworkInterface = NetworkInterfaces.filter(ni => {
      return ni.Groups.filter(group => group.GroupId === GroupId).length;
    });

    SecurityGroup.NetworkInterfaces = ConnectedNetworkInterface;
  });
  
  for (let i = 0; i < SecurityGroups.length; i++) {
    if (SecurityGroups[i].NetworkInterfaces.length) {
      console.log(SecurityGroups[i]);
      break;
    }
  }

  const header = ['OwnerId', 'GroupId', 'GroupName', 'Description', 'Tags', 'NiLength', 'NetworkInterfaces'];
  await csv.writeCsvFile(AWSAccount + '.csv', header, SecurityGroups.map(row => ({
    OwnerId: row.OwnerId,
    GroupId: row.GroupId,
    GroupName: row.GroupName,
    Description: row.Description,
    Tags: JSON.stringify(row.Tags || null),
    NiLength: row.NetworkInterfaces.length,
    NetworkInterfaces: row.NetworkInterfaces.length
      ? `[${row.NetworkInterfaces[0].InterfaceType} ${row.NetworkInterfaces[0].Status}] ${row.NetworkInterfaces[0].NetworkInterfaceId} ${row.NetworkInterfaces[0].Description}`
      : null,
  })))
  
})();