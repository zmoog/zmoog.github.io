---
title: "How to build a custom OpenTelemery collector"
date: 2024-12-24T08:49:38+01:00
tags:
- open-telemetry
draft: false
showToc: true
disableShare: true
ShowPostNavLinks: false
---

OpenTelemery has become a driving force in the observability space, but I only have limited opportuities to explore it during my working life.

Since I want to learn more about OpenTelemetry, I will build a custom OpenTelemetry collector to address the "telemetry needs" in my household.

## About OpenTelemetry

Accordig to [opentelemetry.io](https://opentelemetry.io/), Open Telemetry is:

> [...] a collection of APIs, SDKs, and tools. Use it to instrument, generate, collect, and export telemetry data (metrics, logs, and traces) to help you analyze your software's performance and behavior.

To me, OpenTelemetry — OTel for friends — is a welcome open standardization of everything telemetry, with a standard definition for logs, metrics, and traces data model, open protocols, and a set of ready-to-use tools like the OpenTelemetry collector.

## Why build a custom Collector?

These days, everything is connected to the internet and has an API. I recently renovated my house and installed a solar panel and floor heating system. Both systems have an API! \o/

I want to have a single source of truth for monitoring, analysis, alerting, and long-term storage — in one word, telemetry for my solar panels and floor heating system.

Unfortunately, the OTel collector doesn't support the APIs of my solar panels and floor heating system. So, I need to build a couple of custom receivers and a collector.

## Collector's anatomy

![OTel Collector Anatomy](/images/how-to-build-a-custom-open-telemery-collector-anatomy.png)

## Overview

If you want to learn all the things about building a custom OTel Collector, then the https://opentelemetry.io/docs/collector/custom-collector/ is a good starting point.

Otherwise, here's the chronicle of my journey.

1. Install the OpenTelemetry Collector Builder (OCB)
1. Write the Builder manifest file
1. Generate and build the Collector
1. Testing

## (1) The Collector Builder (OCB)

Building a custom OTel collector is fully supported by the OTel ecosystem. The process is straightforward and well-documented. All you need is the OpenTelemetry Collector Builder (OCB).

> This program generates a custom OpenTelemetry Collector binary based on a given configuration. — [source](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder)

> The OpenTelemetry Community developed a tool called [OpenTelemetry Collector builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder) (or OCB for short) to assist people in assembling their distribution, making it easy to build a distribution that includes their custom components along with publicly available components.

> As part of the process, the OCB will generate the Collector's source code, which you can use to help build and debug your custom components. Let's get started.

Download the OCB pre-build binary for your platform (I am using `darwin_arm64` because I am using an Apple Silicon Mac). At the time of writing, the latest version is 0.116.0.

```sh
# Let's start by creating a folder to host our custom Collector
mkdir collector
cd collector

# Download the OCB pre-build binary for your platform
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2Fv0.116.0/ocb_0.116.0_darwin_arm64

chmod +x ocb
```

Before continuing, let's check if the OCB is working.

```sh
$ ./ocb help     

OpenTelemetry Collector Builder (0.116.0)

ocb generates a custom OpenTelemetry Collector binary using the
build configuration given by the "--config" argument. If no build
configuration is provided, ocb will generate a default Collector.

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
      --skip-compilation         Whether builder should only generate go code with no compile of the Collector (default false)
      --skip-generate            Whether builder should skip generating go code (default false)
      --skip-get-modules         Whether builder should skip updating go.mod and retrieve Go module list (default false)
      --skip-strict-versioning   Whether builder should skip strictly checking the calculated versions following dependency resolution (default true)
      --verbose                  Whether builder should print verbose output (default false)

Use "ocb [command] --help" for more information about a command.
```

Okay, now we're good to go.

## (2) The Builder manifest file

OCB uses a manifest file to generate the custom collector. The manifest file is a YAML file containing the Collector's configuration.


> The builder's manifest file is a YAML where you pass information about the code generation and compile process combined with the components that you would like to add to your Collector's distribution.

> The manifest starts with a map named dist which contains tags to help you configure the code generation and compile process. In fact, all the tags for dist are the equivalent of the OCB command line flags.

We need at least one receiver and one exporter.

For the initial test of the custom collector, I'm going to use the `azureeventhubreceiver` and `elasticsearchexporter`. However, you can choose one of the existing receivers and exporters.

> For a list of components that you can add to your custom collector, see the [OpenTelemetry Registry](https://opentelemetry.io/ecosystem/registry/?language=collector). Note that registry entries provide the full name and version you need to add to your builder-config.yaml.

Add the package names of the components you want to use.

```yaml
# builder-config.yaml
dist:
  name: otelcol-dev
  description: OTel Collector distribution for Azure Streamer
  output_path: ./otelcol-dev

exporters:
  - gomod:
      # NOTE: Prior to v0.86.0 use the `loggingexporter` instead of `debugexporter`.
      go.opentelemetry.io/collector/exporter/debugexporter v0.116.0
  - gomod:
      github.com/open-telemetry/opentelemetry-collector-contrib/exporter/elasticsearchexporter v0.116.0

processors:
  - gomod:
      go.opentelemetry.io/collector/processor/batchprocessor v0.116.0

receivers:
  - gomod:
      github.com/open-telemetry/opentelemetry-collector-contrib/receiver/azureeventhubreceiver v0.116.0

extensions:
  - gomod:
      github.com/open-telemetry/opentelemetry-collector-contrib/extension/basicauthextension v0.116.0
```

## (3) Generate and build

```shell
$ ./ocb --config builder-config.yaml
2024-12-24T09:09:52.584+0100	INFO	internal/command.go:97	OpenTelemetry Collector Builder	{"version": "0.116.0"}
2024-12-24T09:09:52.586+0100	INFO	internal/command.go:102	Using config file	{"path": "builder-config.yaml"}
2024-12-24T09:09:52.587+0100	INFO	builder/config.go:162	Using go	{"go-executable": "/Users/zmoog/.asdf/shims/go"}
2024-12-24T09:09:52.590+0100	INFO	builder/main.go:99	Sources created	{"path": "./otelcol-dev"}
2024-12-24T09:09:54.324+0100	INFO	builder/main.go:190	Getting go modules
2024-12-24T09:10:04.552+0100	INFO	builder/main.go:110	Compiling
2024-12-24T09:10:09.197+0100	INFO	builder/main.go:129	Compiled	{"binary": "./otelcol-dev/otelcol-dev"}
```

The `otelcol-dev` folder contains the generated Collector.

```sh
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

## (4) Testing

Move back to the root folder and set up the environment for testing.

```sh
# move back to the root folder
cd ..

# create a Go workspace to reference the custom collector
go work init
go work use collector/otelcol-dev

# you should see the following output
$ cat go.work
go 1.23.4

use ./collector/otelcol-dev
```

From https://opentelemetry.io/docs/collector/building/receiver, I'm using the following config:

```yaml
# config.yaml
receivers:
  # https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/azureeventhubreceiver
  azureeventhub:
    # the only required setting is the connection string
    connection: ${env:EVENTHUB_CONNECTION_STRING:}
processors:
  batch:

exporters:
  # NOTE: Prior to v0.86.0 use `logging` instead of `debug`.
  debug:
    verbosity: detailed

  # https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/elasticsearchexporter
  elasticsearch:
    endpoints: ${env:ELASTICSEARCH_ENDPOINTS}
    auth:
      authenticator: basicauth

extensions:
  basicauth:
    client_auth:
      username: ${env:ELASTICSEARCH_USERNAME}
      password: ${env:ELASTICSEARCH_PASSWORD}

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

Set the environment variables.

```shell
# use the ";EntityPath=hubName" format that includes the event hub name
export EVENTHUB_CONNECTION_STRING="Endpoint=sb://[redacted];EntityPath=[redacted]"
#
export ELASTICSEARCH_ENDPOINTS=""
export ELASTICSEARCH_USERNAME=""
export ELASTICSEARCH_PASSWORD=""
```

Run the Collector.

```shell
$ go run ./collector/otelcol-dev --config config.yaml
# go.opentelemetry.io/collector/cmd/builder
ld: warning: ignoring duplicate libraries: '-lproc'
2024-12-24T09:22:13.523+0100	info	service@v0.116.0/service.go:164	Setting up own telemetry...
2024-12-24T09:22:13.523+0100	info	telemetry/metrics.go:70	Serving metrics	{"address": "localhost:8888", "metrics level": "Normal"}
2024-12-24T09:22:13.523+0100	debug	builders/builders.go:24	Beta component. May change in the future.	{"kind": "exporter", "data_type": "logs", "name": "elasticsearch"}
2024-12-24T09:22:13.523+0100	warn	elasticsearchexporter@v0.116.0/config.go:378	dedot has been deprecated: in the future, dedotting will always be performed in ECS mode only	{"kind": "exporter", "data_type": "logs", "name": "elasticsearch"}
2024-12-24T09:22:13.523+0100	info	builders/builders.go:26	Development component. May change in the future.	{"kind": "exporter", "data_type": "logs", "name": "debug"}
2024-12-24T09:22:13.523+0100	debug	builders/builders.go:24	Beta component. May change in the future.	{"kind": "processor", "name": "batch", "pipeline": "logs"}
2024-12-24T09:22:13.524+0100	debug	builders/builders.go:24	Alpha component. May change in the future.	{"kind": "receiver", "name": "azureeventhub", "data_type": "logs"}
2024-12-24T09:22:13.524+0100	debug	builders/extension.go:48	Beta component. May change in the future.	{"kind": "extension", "name": "basicauth"}
2024-12-24T09:22:13.524+0100	info	service@v0.116.0/service.go:230	Starting otelcol-dev...	{"Version": "", "NumCPU": 10}
2024-12-24T09:22:13.524+0100	info	extensions/extensions.go:39	Starting extensions...
2024-12-24T09:22:13.524+0100	info	extensions/extensions.go:42	Extension is starting...	{"kind": "extension", "name": "basicauth"}
2024-12-24T09:22:13.524+0100	info	extensions/extensions.go:59	Extension started.	{"kind": "extension", "name": "basicauth"}
2024-12-24T09:22:20.627+0100	debug	azureeventhubreceiver@v0.116.0/receiver.go:106	Log Records	{"kind": "receiver", "name": "azureeventhub", "data_type": "logs", "logs": {}}
2024-12-24T09:22:20.628+0100	debug	azureeventhubreceiver@v0.116.0/receiver.go:106	Log Records	{"kind": "receiver", "name": "azureeventhub", "data_type": "logs", "logs": {}}
2024-12-24T09:22:20.736+0100	debug	azureeventhubreceiver@v0.116.0/receiver.go:106	Log Records	{"kind": "receiver", "name": "azureeventhub", "data_type": "logs", "logs": {}}
```

As new logs land in the event hub, they should be visible in the Elasticsearch instance.

## Conclusion

I learned a lot about the OpenTelemetry Collector and how to build a custom collector. This custome Collector only includees the required components (receiver, processor, exporter, extension) and it's very compact.

But this is just the beginning. In the next step, I will add a receiver for the solar panel system and the floor heating system.

## Refs

Here are the links I used to build this Collector.

- OpenTelemetry guide to build a custom collector: https://opentelemetry.io/docs/collector/custom-collector/
- My public notes: https://github.com/zmoog/public-notes/issues/94
