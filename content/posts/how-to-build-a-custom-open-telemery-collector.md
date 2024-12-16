---
title: "How to build a custom OpenTelemery collector"
date: 2024-12-16T06:06:38+01:00
tags:
- open-telemetry
draft: true
showToc: true
disableShare: true
ShowPostNavLinks: false
---

## About OpenTelemetry

Accordig to the the website, [OpenTelemetry](https://opentelemetry.io/) is

> [...] a collection of APIs, SDKs, and tools. Use it to instrument, generate, collect, and export telemetry data (metrics, logs, and traces) to help you analyze your software’s performance and behavior.

To me OpenTelemetry — OTel for friends — is a welcome open standardization of everything telemetry, with standard definition for logs, metrics, and traces data model, open protocols, and a set of ready to use tools like the OpenTelemetry collector.

Since I want to learn more about OpenTelemetry, I will build a custom OpenTelemetry collector so solve a telemetry problem in my house hold.

## Why build an custom OpenTeletry collector?

(OTel)

I want to build a custom OpenTelemetry (OTel) collector to collect metrics from my solar panels and floor heating system for monitoring, analisys, alerting and long term storage — in one word, telemetry.

## Anatomy of a collector

## Overview

- Install the Builder
- The Builder manifest file
- Generate and build the collector
- Testing

## Install the Builder

https://opentelemetry.io/docs/collector/custom-collector/ seems a good starting point.

> The OpenTelemetry Community developed a tool called [OpenTelemetry Collector builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder) (or ocb for short) to assist people in assembling their own distribution, making it easy to build a distribution that includes their custom components along with components that are publicly available.

> As part of the process the ocb will generate the Collector’s source code, which you can use to help build and debug your own custom components, so let’s get started.

```
mkdir collector
cd collector

curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2Fv0.110.0/ocb_0.110.0_darwin_arm64

chmod +x ocb

OpenTelemetry Collector Builder ((devel))

ocb generates a custom OpenTelemetry Collector binary using the
build configuration given by the "--config" argument. If no build
configuration is provided, ocb will generate a default Collector.

$ ./ocb help     

Usage:
  ocb [flags]
  ocb [command]

Available Commands:
  completion  Generate the autocompletion script for the specified shell
  help        Help about any command
  version     Version of ocb

Flags:
      --config string            build configuration file
  -h, --help                     help for ocb
      --ldflags string           ldflags to include in the "go build" command
      --skip-compilation         Whether builder should only generate go code with no compile of the collector (default false)
      --skip-generate            Whether builder should skip generating go code (default false)
      --skip-get-modules         Whether builder should skip updating go.mod and retrieve Go module list (default false)
      --skip-strict-versioning   Whether builder should skip strictly checking the calculated versions following dependency resolution (default true)
      --verbose                  Whether builder should print verbose output (default false)

Use "ocb [command] --help" for more information about a command.
```

We're good to go.

## The Builder manifest file

> The builder’s manifest file is a yaml where you pass information about the code generation and compile process combined with the components that you would like to add to your Collector’s distribution.

> The manifest starts with a map named dist which contains tags to help you configure the code generation and compile process. In fact, all the tags for dist are the equivalent of the ocb command line flags.

For the initial test of the custom collector, I'm going to use the `azureeventhubreceiver` and `elasticsearchexporter`.

```yaml
# builder-config.yaml
dist:
  name: otelcol-dev
  description: OTel Collector distribution for Azure Streamer
  output_path: ./otelcol-dev
  otelcol_version: 0.110.0

exporters:
  - gomod:
      # NOTE: Prior to v0.86.0 use the `loggingexporter` instead of `debugexporter`.
      go.opentelemetry.io/collector/exporter/debugexporter v0.110.0
  - gomod:
      github.com/open-telemetry/opentelemetry-collector-contrib/exporter/elasticsearchexporter v0.110.0

processors:
  - gomod:
      go.opentelemetry.io/collector/processor/batchprocessor v0.110.0

receivers:
  - gomod:
      github.com/open-telemetry/opentelemetry-collector-contrib/receiver/azureeventhubreceiver v0.110.0

```


> For a list of components that you can add to your custom collector, see the [OpenTelemetry Registry](https://opentelemetry.io/ecosystem/registry/?language=collector). Note that registry entries provide the full name and version you need to add to your builder-config.yaml.

## Step 3 - Generating the Code and Building your Collector’s distribution

```shell
$ ./ocb --config builder-config.yaml

2024-10-02T19:05:00.867+0200    INFO    internal/command.go:125 OpenTelemetry Collector Builder {"version": "(devel)"}
2024-10-02T19:05:00.871+0200    INFO    internal/command.go:161 Using config file       {"path": "builder-config.yaml"}
2024-10-02T19:05:00.871+0200    INFO    builder/config.go:142   Using go        {"go-executable": "/Users/zmoog/.asdf/shims/go"}
2024-10-02T19:05:00.873+0200    INFO    builder/main.go:101     Sources created {"path": "./otelcol-dev"}
2024-10-02T19:05:26.466+0200    INFO    builder/main.go:192     Getting go modules
2024-10-02T19:05:44.312+0200    INFO    builder/main.go:112     Compiling
2024-10-02T19:06:05.611+0200    INFO    builder/main.go:131     Compiled        {"binary": "./otelcol-dev/otelcol-dev"}

$ tree
.
├── builder-config.yaml
├── ocb
└── otelcol-dev
    ├── components.go
    ├── go.mod
    ├── go.sum
    ├── main.go
    ├── main_others.go
    ├── main_windows.go
    └── otelcol-dev

1 directory, 9 files
```

> You can now use the generated code to bootstrap your component development projects and easily build and distribute your own collector distribution with your components.

## Testing the collector

From https://opentelemetry.io/docs/collector/building/receiver/, I'm using the following config:

```yaml
# config.yaml
receivers:
  # https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/azureeventhubreceiver
  azureeventhub:
    # the only required setting is the connection string
    connection: ${EVENTHUB_CONNECTION_STRING}
processors:
  batch:

exporters:
  # NOTE: Prior to v0.86.0 use `logging` instead of `debug`.
  debug:
    verbosity: detailed

  # https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/elasticsearchexporter
  elasticsearch:
    endpoints: ${ELASTICSEARCH_ENDPOINTS}
    auth:
      authenticator: basicauth

extensions:
  basicauth:
    client_auth:
      username: ${ELASTICSEARCH_USERNAME}
      password: ${ELASTICSEARCH_PASSWORD}

service:
  extensions: [basicauth]
  pipelines:
    logs:
      receivers: [azureeventhub]
      processors: [batch]
      exporters: [elasticsearch, debug]
  telemetry:
    logs:
      level: debug
```

How to run the custom collector:

```shell
# use the ";EntityPath=hubName" format
export EVENTHUB_CONNECTION_STRING=""
export ELASTICSEARCH_ENDPOINTS=""
export ELASTICSEARCH_USERNAME=""
export ELASTICSEARCH_PASSWORD=""
```

```shell
$ go run ./otelcol-dev --config config.yaml  

2024-10-05T08:48:25.336+0200    info    service@v0.110.0/service.go:137 Setting up own telemetry...
2024-10-05T08:48:25.337+0200    info    service@v0.110.0/service.go:186 Skipped telemetry setup.
2024-10-05T08:48:25.337+0200    info    builders/builders.go:26 Development component. May change in the future.        {"kind": "exporter", "data_type": "logs", "name": "debug"}
2024-10-05T08:48:25.339+0200    debug   builders/builders.go:24 Beta component. May change in the future.       {"kind": "exporter", "data_type": "logs", "name": "elasticsearch"}
2024-10-05T08:48:25.339+0200    warn    elasticsearchexporter@v0.110.0/config.go:359    dedot has been deprecated: in the future, dedotting will always be performed in ECS mode only   {"kind": "exporter", "data_type": "logs", "name": "elasticsearch"}
2024-10-05T08:48:25.339+0200    debug   builders/builders.go:24 Beta component. May change in the future.       {"kind": "processor", "name": "batch", "pipeline": "logs"}
2024-10-05T08:48:25.340+0200    debug   builders/builders.go:24 Alpha component. May change in the future.      {"kind": "receiver", "name": "azureeventhub", "data_type": "logs"}
2024-10-05T08:48:25.340+0200    debug   builders/extension.go:48        Beta component. May change in the future.       {"kind": "extension", "name": "basicauth"}
2024-10-05T08:48:25.332+0200    warn    envprovider@v1.16.0/provider.go:59      Configuration references unset environment variable     {"name": "ELASTICSEARCH_PASSWORD"}
2024-10-05T08:48:25.340+0200    info    service@v0.110.0/service.go:208 Starting otelcol-dev... {"Version": "1.0.0", "NumCPU": 10}
2024-10-05T08:48:25.340+0200    info    extensions/extensions.go:39     Starting extensions...
2024-10-05T08:48:25.340+0200    info    extensions/extensions.go:42     Extension is starting...        {"kind": "extension", "name": "basicauth"}
2024-10-05T08:48:25.340+0200    info    extensions/extensions.go:59     Extension started.      {"kind": "extension", "name": "basicauth"}
2024-10-05T08:48:36.179+0200    info    service@v0.110.0/service.go:234 Everything is ready. Begin running and processing data.

```

## Refs

https://github.com/zmoog/public-notes/issues/94
