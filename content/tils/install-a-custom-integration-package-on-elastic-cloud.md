---
title: "Install a custom integration package into a cluster on Elastic Cloud"
date: 2024-01-19T00:01:34+01:00
draft: false
categories:
- til
tags:
- elastic
showToc: true
disableShare: true
ShowPostNavLinks: false
---

I need to install a development version of an integration package into a cluster running on Elastic Cloud.

## Build

Build the package using `elastic-package` and copy the `.zip` file in a safe place:

```shell
#
# If you don't already have it, clone the Elastic Agent
# integrations repo:
#
# git clone git@github.com:elastic/integrations.git
#

cd packages/kubernetes

elastic-package build

cp ../../build/packages/kubernetes-1.44.0.zip /somewhere/safe/
```

## Deploy

Set up the required environment variables:

```shell
export ELASTIC_PACKAGE_KIBANA_HOST="https://<URL>:9243"
export ELASTIC_PACKAGE_ELASTICSEARCH_USERNAME="elastic"
export ELASTIC_PACKAGE_ELASTICSEARCH_PASSWORD="<REDACTED>"
```

Note: use the username and password of a user local to the cluster.

And finally, install the package using the `.zip` file:

```shell
$ elastic-package install --zip /somewhere/safe/kubernetes-1.44.0.zip -v
2023/09/05 15:20:57 DEBUG Enable verbose logging
2023/09/05 15:20:58 DEBUG GET https://<KIBANA_HOST>:9243/api/status
2023/09/05 15:20:58 DEBUG Validating built .zip package (path: kubernetes-1.44.0.zip)
2023/09/05 15:20:59 DEBUG Skip validation of the built .zip package
2023/09/05 15:20:59 DEBUG POST https://<KIBANA_HOST>:9243/api/fleet/epm/packages
```

## References

- https://github.com/zmoog/public-notes/issues/50
- https://github.com/elastic/elastic-package/blob/main/docs/howto/install_package.md 
