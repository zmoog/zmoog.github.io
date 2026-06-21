---
author: "Maurizio Branca"
title: "Beats debugging"
date: 2023-09-27T08:42:11+01:00
draft: false
tags:
  elastic
  golang
  debug
categories:
  tutorial
---

From the thread issue https://github.com/zmoog/public-notes/issues/28

Suppose you want to run Filebeat in debug mode to explore in detail how Filebeat executes some portion of the code.

Open the `main.go` file at `x-pack/filebeat/main.go` and "Modify Run Configuration":

![CleanShot 2023-03-31 at 15 53 26@2x](https://user-images.githubusercontent.com/25941/229139310-ba4778b1-6edf-41d2-8960-518b08bd3eaf.png)

In Program Argument, set the following content:

```
-e
-v
-d
*
--strict.perms=false
--path.home
/Users/zmoog/code/projects/elastic/beats/x-pack/filebeat
-E
cloud.id=REDACTED
-E
cloud.auth=REDACTED
-E
gc_percent=100
-E
setup.ilm.enabled=false
-E
setup.template.enabled=false
-E
output.elasticsearch.allow_older_versions=true
```

Set `cloud.id` and `cloud.auth` with your actual values to access your Elasticsearch cluster.

Enable one module; we have something to prove this is working.

```shell
# open a terminal at the project root and cd into filebeat
$ cd x-pack/filebeat/ 

# enable the azure module
$ cp modules.d/azure.yml.disabled modules.d/azure.yml 
```

Edit `modules.d/azure.yml` and enable at least one input. 

For example, for this test I am enabling the sign in logs:

```yaml
  signinlogs:
    enabled: true
    var:
      eventhub: REDACTED
      consumer_group: "$Default"
      connection_string: REDACTED
      storage_account: REDACTED
      storage_account_key: REDACTED
```

The sign-in logs input uses the azure-eventhub input, so I want to place a breakpoint at:

https://github.com/elastic/beats/blob/62a27007e67c337b3d9e6fd78acffad1799a7c2e/x-pack/filebeat/input/azureeventhub/input.go#L108

Here is how it goes:

https://user-images.githubusercontent.com/25941/229150589-0606266c-bc33-4264-adb1-4b94a1c0d6e7.mp4

{{< rawhtml >}} 

<video width=100% controls autoplay>
    <source src="https://user-images.githubusercontent.com/25941/229150589-0606266c-bc33-4264-adb1-4b94a1c0d6e7.mp4" type="video/mp4">
    Your browser does not support the video tag.  
</video>

{{< /rawhtml >}}
