---
title: "Remove a resource from the Terraform state"
date: 2025-08-07T17:44:00+00:00
draft: false
categories:
- til
tags:
- terraform
showToc: false
disableShare: true
ShowPostNavLinks: false
---

Sometimes you're working on a codebase new to you and `terraform destroy` fails with a weird error like:

```sh
╷
│ Error: Get "http://localhost/api/v1/namespaces/kube-public/configmaps/local-registry-hosting": dial tcp [::1]:80: connect: connection refused
│
│   with kubernetes_config_map.registry,
│   on main.tf line 97, in resource "kubernetes_config_map" "registry":
│   97: resource "kubernetes_config_map" "registry" {
│
╵
```

This is probably an edge case in the `kubernetes_config_map` combined with EKS.

You should fix the root cause, but if it's late and all you want is tear down the test EKS cluster, you can remove the offending configmap from the state:

```sh
# search for the offending resource in the state
$ terraform state list | grep config
kubernetes_config_map.registry
module.eks.terraform_data.kubeconfig
```

Remove the configmap from the state:

```sh
$ terraform state rm kubernetes_config_map.registry
Removed kubernetes_config_map.registry
Successfully removed 1 resource instance(s).
```

And continue destroying the EKS cluster, and start troubleshooting the root cause tomorrow morning with a fresh mind.
