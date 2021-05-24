## AZURE Details

### The Meta should be configured as follows:
```
{
  "key": "123",
  "organization": "Your Organization",
  "project": "Your Project",
  "releases": [
    "Name of the stages in the pipeline that should be considered as deploys"
  ],
  "bugsQuery": "WIQL to query bugs in Azure Devops"
}
```
Provider name: azure

The supported metrics are:
- build
- release
- bug