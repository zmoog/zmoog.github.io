---
title: "How to inspect a GitHub token"
pubDatetime: 2025-02-16T14:50:34+01:00
draft: false
tags:
  - github
description: "Use the GitHub API to identify the owner and details of any GitHub token."
---

Sometimes, you stumble upon a GitHub token that you don't know where it's coming from or to whom it belongs.

Here's how to discover the owner:


```sh
export GITHUB_TOKEN="<your GitHub token goes here>"

$ curl -H "Authorization: bearer ${GITHUB_TOKEN}" https://api.github.com/user
{
  "login": "zmoog",
  "id": 25941,
  "avatar_url": "https://avatars.githubusercontent.com/u/25941?v=4",
  "name": "Maurizio Branca",
  "company": "Elastic",
  "blog": "https://zmoog.dev",
  "location": "Verolengo, Turin, Italy",
  "bio": "I'm a software engineer from Italy. Passionate about programming, video games, bots, and note-taking.",
  "public_repos": 102,
  "public_gists": 9,
  "followers": 36,
  "following": 35,
  "created_at": "2008-09-23T17:16:36Z",
  "updated_at": "2025-02-13T11:31:19Z"
}
```
