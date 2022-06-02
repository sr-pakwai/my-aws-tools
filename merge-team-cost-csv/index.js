import fs from 'fs';
import aws from './aws-utils';
import * as csvWriter from 'csv-writer';
import config from './config';

const USE_SAVED_FILE = true;

(async function start() {
  try {
    const TimePeriod = config.TimePeriod;
    const LinkedAccounts = config.LinkedAccounts;
    const TeamTags = config.TeamTags;

    const header = ['Date', 'Team', 'LinkedAccount', 'Service', 'Cost']
      .map(key => ({ id: key, title: key }));

    const createCsvWriter = csvWriter.createObjectCsvWriter;
    const writer = createCsvWriter({
      header,
      path: './output/costs.csv',
    });

    for(const TeamTag of TeamTags) {
      for(const LinkedAccount of LinkedAccounts) {
        let data;
        if (!USE_SAVED_FILE)
          data = await aws.GetCostAndUsageBy(TimePeriod, LinkedAccount, TeamTag, true);
        else
          data = JSON.parse(fs.readFileSync('./output/' + `${TimePeriod.Start}_${LinkedAccount}_${TeamTag}.json`));

        const transformData = data.ResultsByTime.map(o => {
          const Date = o.TimePeriod.Start;
          const Serivces = o.Groups.map(p => ({
            Date: o.TimePeriod.Start,
            Team: TeamTag,
            LinkedAccount: LinkedAccount,
            Service: p.Keys[0],
            Cost: p.Metrics.UnblendedCost.Amount,
          }));
          return Serivces;
        }).flat();

        if (transformData.length)
          await writer.writeRecords(transformData);
      }
    }

    console.log('done!!!');
  } catch (e) {
    console.error(e);
  }
})();