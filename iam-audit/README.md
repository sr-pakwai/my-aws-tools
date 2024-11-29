# IAM Audit Script

Scan through all the IAM resources (Users, Roles, Policies) into and digestable output format.

The goal is to audit the IAM for unused resources (based on created/last access date). And, make a decision for clean up.

## Get started
```
npm install
node index.js
```

## Output
```
User: {{username}}
  Created: {{date in ISO}}
  Tags: [{...tags}]
  Last used service: {{service name}}
  Last used date: {{last use date}}
  Last used region: {{last use region}}

Role: {{role name}}
  Created: {{date in ISO}}
  Tags: None
  Last used service: Never
  Last used date: Never
  Last used region: Never

Policy: {{policy name}}
  Created: {{date in ISO}}
  Attachments: {{attachment count}}
  Tags: None
  Status: In use | Unused
    Groups: [...GroupName]
    Users: [...userName]
    Roles: [...roleName]
```
