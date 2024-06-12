const { S3Client, ListBucketsCommand, GetBucketTaggingCommand, GetBucketLocationCommand } = require('@aws-sdk/client-s3');
const { writeFile } = require('fs/promises'); // Import for writing to file

// Configure AWS SDK with your credentials
const s3Client = new S3Client({ region: 'us-west-2' }); // Replace with your region

async function getUntaggedBuckets() {
  const command = new ListBucketsCommand({});  // Create a ListBucketsCommand object
  const buckets = await s3Client.send(command);  // Send the command and get results

  const untaggedBuckets = [];
  const taggedBuckets = [];
  let csvData = 'Bucket Name,Region,Created Date\n';  // CSV header

  for (const bucket of buckets.Buckets) {
    try {
      // console.log(bucket);
      const locCommand = new GetBucketLocationCommand({ Bucket: bucket.Name });
      const loc = await s3Client.send(locCommand);
      const region = loc.LocationConstraint;

      if (region !== 'us-west-2')
        continue;

      const tagCommand = new GetBucketTaggingCommand({ Bucket: bucket.Name })
      const tags = await s3Client.send(tagCommand);
      const isTagged = tags.TagSet != null && tags.TagSet.length > 0;
      if (!isTagged) {
        untaggedBuckets.push(bucket.Name);
        csvData += `"${bucket.Name}","${region}","${CreationDate}"\n`;  // Add data to CSV string
      }
      else
        taggedBuckets.push(bucket.Name);
    } catch (err) {
      // if (err.code !== 'NoSuchTagSet') {
      //   throw err;
      // }
      console.error(err);
    }
  }

  await writeFile('s3_bucket_no_tags.csv', csvData); // Write CSV data to file
  console.log('S3 with tags count:', taggedBuckets.length);
  return untaggedBuckets;
}

getUntaggedBuckets()
  .then((buckets) => {
    if (buckets.length > 0) {
      console.log('Untagged Buckets:');
      buckets.forEach((bucket) => console.log(bucket));
    } else {
      console.log('No untagged buckets found.');
    }
  })
  .catch((err) => console.error('Error:', err));