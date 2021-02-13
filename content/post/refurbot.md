---
title: "Refurbot: a serverless bot that tweets"
date: 2021-02-13T08:42:11+01:00
draft: true
---

## The Serverless Opportunity

Writing bots is fun. Sometimes is even useful, but most of the time you write one because is really fun.

Since these are fun-driven project, traditionally to keep them running you had to deal with the hassle on keep them running on your computer, some random Pis, or on an EC2 instance .

Are there other solutions to run a bot? Hell, yeah!

A serverless bot! ⚡️

Bots are one kind of application can be run easyly within the free tiers of most cloud providers.

In this article I'll share with you Refurbot, a simple twitter bot that every day tweets the best deal available in the refurbisted products section of the Apple Store.


## Introducing Refurbot

Every morning at 9 am (CET) Refurbot will wake up and have breakfast. Then, it will access the Apple Store to fetch the latest deals, find the best one (percentage wise) and tweet it to its huge audience (it's just me).


### The GitHub repository is wide open

https://github.com/zmoog/refurbot

### Architecture

Refurbot has been designed using the [clean architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) principles. Totally overkill for a simple project like this, but sometimes it's useful to test or practice using simple context and then progressively move up to something more complex.

![Refurbot Architecture](images/refurbot-architecture.png)

> high level architecture with adapters, message bus, etc

## AWS and Twitter accounts

Refurbot requires an AWS account and a Twitter account.

### AWS

https://aws.amazon.com

### Twitter



## Refurbished library
## Tweepy library
## Serverless framework
## Commands and events
## Schedule
