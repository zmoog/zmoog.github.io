---
title: "Sort values as version numbers using the sort command"
date: 2024-03-08T13:48:00+01:00
draft: false
categories:
- til
tags:
- shell
showToc: false
disableShare: true
ShowPostNavLinks: false
---

Earlier today, I was listing the releases in a GitHub repo:

```shell
$ gh release list --limit 10 | awk -F ' ' '{print $2}'
8.12.2
8.12.1
7.17.18
7.17.17
8.12.0
8.11.4
8.11.3
7.17.16
8.11.2
7.17.15
```

The GitHub CLI returns the release in chronologica order, which makes perfercly sense for releases.

However, I needed them version order, so I tried my old friend `sort`:

```shell
$ gh release list --limit 25 | awk -F ' ' '{print $2}' | sort -r
8.9.2
8.9.1
8.9.0
8.8.2
8.12.2
8.12.1
8.12.0
8.11.4
8.11.3
8.11.2
8.11.1
8.11.0
8.10.4
8.10.3
8.10.2
8.10.1
8.10.0
7.17.18
7.17.17
7.17.16
7.17.15
7.17.14
7.17.13
7.17.12
7.17.11
```

`sort` sorts the values using the natural orders, but it doesn't work for version numbers.

But, TIL, why `sort` is our friend: "There's a switch for that"!

```shell
$ gh release list --limit 25 | awk -F ' ' '{print $2}' | sort -r -V
8.12.2
8.12.1
8.12.0
8.11.4
8.11.3
8.11.2
8.11.1
8.11.0
8.10.4
8.10.3
8.10.2
8.10.1
8.10.0
8.9.2
8.9.1
8.9.0
8.8.2
7.17.18
7.17.17
7.17.16
7.17.15
7.17.14
7.17.13
7.17.12
7.17.11
```

Using the `-V` option, `sort` sorts values as version numbers.
