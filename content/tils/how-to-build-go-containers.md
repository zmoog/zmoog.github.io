---
title: "How to build Go containers"
date: 2025-02-17T21:09:44+00:00
draft: false
categories:
- til
tags:
- golang
- containers
showToc: false
disableShare: true
ShowPostNavLinks: false
---

I used Docker to containerize projects like Bender and my custom OTel Collector. However, after glancing at one of the projects my teammates were working on, I decided to take a look at [ko](https://ko.build).

Oh my gosh! Ko is such a magnificent tool!

It brings the simplicity, efficiency, and fun of Go to containerization. If you need to build a container for your Go app, stop searching and start using ko.

To build a container, you don't need Docker. Pick your favorite registry, for example, the GitHub Container Registry, and:

```sh
# Set KO_DOCKER_REPO to ghcr.io/<owner>/<repo> to target GHCR
export KO_DOCKER_REPO=ghcr.io/zmoog/otel-collector-contrib

# Set GITHUB_TOKEN with a classic PAT with packages:read and packages:write scopes
export GITHUB_TOKEN=<your GitHub token goes here>

# Run a multi-architecture build for amd64 and arm64 architectures
$ ko build . --platform=linux/amd64,linux/arm64 --bare
```

That's it!

You now have your app as a multi-architecture container ready to deploy.

You can't go better than this 15-minute talk from Jason Hall for a great introduction to ko.

Enjoy.

- [Jason Hall – "ko: The Only Good Way to Build Go Containers"](https://www.youtube.com/watch?v=goEjs22Ymk4)
- https://ko.build/get-started/
