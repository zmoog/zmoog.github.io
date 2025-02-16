---
title: "Inspect a GitHub token"
date: 2025-02-16T14:50:34+01:00
draft: false
categories:
- til
tags:
- github
showToc: false
disableShare: true
ShowPostNavLinks: false
---

Sometimes you stuble upon a GitHub token you don't know from where it's coming, or who it belongs to.

Here's how to discover the owner:

```sh
export GITHUB_TOKEN="<your GitHub token goes here>"

$ curl -H "Authorization: bearer ${GITHUB_TOKEN}" https://api.github.com/user
{
  "login": "zmoog",
  "id": 25941,
  "avatar_url": "https://avatars.githubusercontent.com/u/25941?v=4",
  "gravatar_id": "",
  "url": "https://api.github.com/users/zmoog",
  "html_url": "https://github.com/zmoog",
  "followers_url": "https://api.github.com/users/zmoog/followers",
  "following_url": "https://api.github.com/users/zmoog/following{/other_user}",
  "gists_url": "https://api.github.com/users/zmoog/gists{/gist_id}",
  "starred_url": "https://api.github.com/users/zmoog/starred{/owner}{/repo}",
  "subscriptions_url": "https://api.github.com/users/zmoog/subscriptions",
  "organizations_url": "https://api.github.com/users/zmoog/orgs",
  "repos_url": "https://api.github.com/users/zmoog/repos",
  "events_url": "https://api.github.com/users/zmoog/events{/privacy}",
  "received_events_url": "https://api.github.com/users/zmoog/received_events",
  "type": "User",
  "user_view_type": "public",
  "site_admin": false,
  "name": "Maurizio Branca",
  "company": "Elastic",
  "blog": "https://zmoog.dev",
  "location": "Verolengo, Turin, Italy",
  "hireable": null,
  "bio": "I'm a software engineer from Italy. Passionate about programming, video games, bots, and note-taking.",
  "twitter_username": null,
  "notification_email": "maurizio.branca@gmail.com",
  "public_repos": 102,
  "public_gists": 9,
  "followers": 36,
  "following": 35,
  "created_at": "2008-09-23T17:16:36Z",
  "updated_at": "2025-02-13T11:31:19Z"
}
```
