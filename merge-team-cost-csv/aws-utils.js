import AWS from 'aws-sdk';
import fs from 'fs';

async function GetCostAndUsageBy(TimePeriod, LinkedAccount, TeamTag, SaveOutput = false) {
  const costexplorer = new AWS.CostExplorer({
    apiVersion: '2017-10-25',
    region: 'us-east-1',
  });

  const params = {
    Metrics: ['UNBLENDED_COST'],
    TimePeriod,
    Granularity: 'DAILY', /* MONTHLY or HOURLY */
    GroupBy: [
      {
        Key: 'SERVICE',
        Type: 'DIMENSION',
      },
    ],
    Filter: {
      And: [
        {
          Dimensions: {
            Key: 'LINKED_ACCOUNT',
            Values: [LinkedAccount],
            MatchOptions: ['EQUALS'],
          },
        },
        {
          Tags: {
            Key: 'Team',
            MatchOptions: ['EQUALS'],
            Values: [TeamTag],
          }
        },
      ],
    },
  };

  if (TeamTag === 'team:no-tag')
    params.Filter.And[1].Tags = {
      Key: 'Team',
      MatchOptions: ['ABSENT'],
    };
  
  const data = await new Promise((resolve, reject) =>
    costexplorer.getCostAndUsage(params, (err, data) => {
      if (err) reject(err, err.stack); // an error occurred
      else resolve(data);           // successful response
    })
  );

  if (SaveOutput) {
    const filename = `${TimePeriod.Start}_${LinkedAccount}_${TeamTag}.json`;
    console.log('writing raw results for:', filename);
    fs.writeFileSync('./output/' + filename, JSON.stringify(data, null, 2));
  }

  return data;
}

module.exports = { GetCostAndUsageBy };
