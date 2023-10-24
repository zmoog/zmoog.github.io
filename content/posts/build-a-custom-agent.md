---
title: "Build a custom Elastic Agent"
date: 2023-10-18T07:54:00+01:00
draft: false
---

The [Elastic Agent](https://www.elastic.co/elastic-agent) is a unified agent to collect data and send them to the Elasticsearch cluster.

The main functionalities are:

- Data collection
- Central management of agents in Kibana
- Easy to use integrations


## Why build a custom Elastic Agent?

If you are an integration developer, sooner or later you'll end up needing a custom agent build. 

Maybe you just added a new feature or fixed a bug on Beats and you want to test it with the Agent. Or you want to give a PR from another developer a try.

If you want to run a custom version of Beats as an agent component, this guide is for you.

## Anatomy of the Agent

For the data collection feature, the current version of Elastic Agent leverages Filebeat, Metricbeat, and other beats under the hood. It orachestrates them behind the scenes. 

So to build the Agent, you first need to build at least Filebeat and Metricbeat to achieve the basic data collection functionality.

## Overview

This guide is organized in three different sections: Build, Run, and Share.

Build
- Build Filebeat
- Build Metricbeat
- Build or download other Beats (optional)
- Finaly, build the Agent

Run
- Enroll on Elastic Cloud
- Enroll on local stack with elastic-package

Share
- Share an Agent image on Docker Hub


## Build

### A small change to ship

For this guide, we'll make a trivial change to Filebeat:

```diff
ff --git a/x-pack/filebeat/input/azureeventhub/input.go b/x-pack/filebeat/input/azureeventhub/input.go
index 9c3a0d5980..d2678953be 100644
--- a/x-pack/filebeat/input/azureeventhub/input.go
+++ b/x-pack/filebeat/input/azureeventhub/input.go
@@ -106,7 +106,7 @@ func (a *azureInput) Run() {
        // guarantees that we only start the worker once during the first
        // invocation.
        a.workerOnce.Do(func() {
-               a.log.Infof("%s input worker is starting.", inputName)
+               a.log.Infof("%s input worker is starting (custom version).", inputName)
                err := a.runWithEPH()
                if err != nil {
```

And we will try to run this code on my local stack.

This guide is based on the great [gist](https://gist.github.com/leehinman/4b1b467b7102b30c1c8a5c7139fe549c#orgb105d81) from Lee Hinman and the standard Elastic Agent [README](https://github.com/elastic/elastic-agent#docker) file.

### Setting up
#### Which version?
#### Temporary folders

We need a couple of folders to store the Beats distribution files we'll create during this process:

```shell
mkdir -p ~/tmp/artifacts
mkdir -p ~/tmp/agent_drop_path
```

### Build Filebeat

In this phase, we checkout the `main` branch from Beats and cross compiled the Linux version:

```shell
cd ~/src/beats

git checkout main

cd x-pack/filebeat

# build the tar.gz distribution of Filebeat — we can save time skipping other distribution formats (RPM, DEB, etc)
DEV=true SNAPSHOT=true PLATFORMS="linux/amd64" PACKAGES=tar.gz mage -v clean package

# copy the distribution tarball to the artifacts folder
cp build/distributions/filebeat-8.9.0-SNAPSHOT-linux-x86_64.tar.gz* ~/tmp/artifacts
```

### Build Metricbeat

Agent also requires Metricbeat to run. You can build Metricbeat using the same process or download it.

If you want download it, you can search for the right version at https://artifacts-staging.elastic.co/dra-info/index.html

### Build the Agent

```shell
cd ~/src/elastic-agent

git checkout main

cp ~/tmp/artifacts/* ~/tmp/agent_drop_path

# Build the docker image for the Agent 
DEV=true \
SNAPSHOT=true \
AGENT_DROP_PATH=~/tmp/agent_drop_path PLATFORMS="linux/amd64" \
PACKAGES="docker" \
mage -v clean package
```

Here's the images:

```shell
$ docker images | grep 8.9
docker.elastic.co/beats-ci/elastic-agent-cloud           8.9.0-SNAPSHOT            8ac0928fe15f   8 minutes ago    1.16GB
docker.elastic.co/beats/elastic-agent-complete           8.9.0-SNAPSHOT            9111d425c7ca   10 minutes ago   2.4GB
docker.elastic.co/beats/elastic-agent                    8.9.0-SNAPSHOT            5e075f310b80   13 minutes ago   696MB
docker.elastic.co/beats/elastic-agent-ubi8               8.9.0-SNAPSHOT            d0d869781474   16 minutes ago   669MB
<none>                                                   <none>                    8e9c63fb851f   8 hours ago      1.9GB
docker.elastic.co/elasticsearch/elasticsearch            8.9.0-SNAPSHOT            42d9c3f51323   38 hours ago     1.33GB
docker.elastic.co/kibana/kibana                          8.9.0-SNAPSHOT            874a16715cde   2 days ago       862MB
<none>                                                   <none>                    174980968dc9   12 months ago    272MB
```

The custom images we just built start with `docker.elastic.co/beats/elastic-agent*`


## Run

### Enroll on Elastic Cloud

### Enroll on local stack with elastic-package

For testing purposes, enrolling your custom Agent on your local stack is a compelling option.

#### Start your local stack

We can now bootstrap the local stack:

```shell
cd ~/src/integrations/packages/azure

elastic-package build && elastic-package stack up --version=8.9.0-SNAPSHOT -v
```

Note: the local stack will NOT use our custom docker image. Instead, it will use the following image:

```
docker.elastic.co/elastic-agent/elastic-agent-complete
```


#### Run the Agent

We can finally run our custom Agent creating enrolling it the Fleet server running on the local stack:

```
docker run  --rm \
  --network elastic-package-stack_default \
  -e FLEET_URL=https://fleet-server:8220 \
  -e FLEET_ENROLL=true \
  -e FLEET_INSECURE=true \
  -e FLEET_ENROLLMENT_TOKEN=${ENROLLMENT_TOKEN} \
  -i docker.elastic.co/beats/elastic-agent:8.9.0-SNAPSHOT
```

The Agent is running the custom Filebeat build.

![CleanShot 2023-05-10 at 11 54 59@2x](https://github.com/zmoog/public-notes/assets/25941/9e1ba656-d926-4afa-a098-ad215d0dc94c)

## Share

Instead of just running it on your local stack, you can also share the custom agent image with other user to use or test.

### Share an Agent image on Docker Hub

After you have build the Docker image, here's how to share it with other people using Docker Hub.

```shell
docker tag docker.elastic.co/beats/elastic-agent:8.9.0-SNAPSHOT zmoog/elastic-agent:8.9.0-SNAPSHOT

docker push zmoog/elastic-agent:8.9.0-SNAPSHOT
```


***


## Building
### Build Filebeat
### Build (or download) Metricbeat and the other beats
### Build Elastic Agent

## Running
### Start your local stack


### Enroll your custom Agent
#### Enroll
## Publishing
### Publish the Docker image on Docker Hub
### Enable insecure output

The new Agent is now running using the agent policy bound to the enrollment token used.

However, if you install an integration, the Agent will not be able to send data to the local stack due to considering the self-signed certificate used by the local stack insecure.

We must add a custom output to enable the Agent to send data. In this output, we'll add:

```text
# Hosts
https://elasticsearch:9200

# Advanced YAML configuration
ssl.verification_mode: "none"
```

options to turn off the certificate verification. All traffic will happen on a transient local stack, so we're not putting anything at risk.

Here's how to add the custom output and enable it for the agent policy:

https://github.com/zmoog/public-notes/assets/25941/cd86f7a2-73e5-4f80-9c23-9db08dc2030a

