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
![Refurbot Architecture](/images/refurbot-screenshots.png)


### Architecture

Refurbot is a small Python serverless application, and has been designed using the [clean architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) principles. 

Totally overkill for a simple project like this, but sometimes it's useful to test or practice using simple context and then progressively move up to something more complex.

![Refurbot Architecture](/images/refurbot-architecture-high-level.png)


### The GitHub repository is wide open

Refurbot is available as a ready to deploy project on GitHub, visit https://github.com/zmoog/refurbot to learn more.


## AWS and Twitter accounts

Refurbot requires an AWS account and a Twitter account.

### AWS

You need a new AWS account to deploy your serverless bot. 

#### Services

Refurbot is a trivial example and only requires [AWS Lambda](https://aws.amazon.com/lambda/) (code execution) and CloudWatch (for scheduling). Fortunately the [AWS Free Tier](https://aws.amazon.com/free/) also includes others "always free" services [Amazon DynamoDB](https://aws.amazon.com/dynamodb/), [SNS](https://aws.amazon.com/sns/), [SQS](https://aws.amazon.com/sqs/) and [Step Functions](https://aws.amazon.com/step-functions/)) that can be used to build and run a hobby, or even a small scale, bot for free.

 * Visit https://aws.amazon.com and create a new AWS account
 * Create a IAM user and the credentials to use it to access AWS from the terminal

### Twitter

 * Create a new Twitter account to use as a bot.
 * Apply for a developer account at https://developer.twitter.com/ using your new account.
 * Access the Developer Portal, and create a new Project and application.

## Libraries
### Refurbished

[Refurbished](https://github.com/zmoog/refurbished/) is a simple Python library (also [available on PyPI](https://pypi.org/project/refurbished/)) used to scrape the Apple Store and search for refurbished products.

#### Library

Refurbot is using it from the Adapter:
```
>>> from refurbished import Store
>>> store = Store(country="us")
>>> ipads = store.get_ipads()
>>> 
>>> print(next(ipads).name)
Refurbished iPad mini 4 Wi-Fi + Cellular 64GB - Silver
```

#### Use the CLI Luke!

Once installed, the [library](https://pypi.org/project/refurbished/) comes with a nice [CLI](https://github.com/zmoog/refurbished/blob/master/cli/rfrb) you can use to search products from the terminal:

```shell
% rfrb it macs --min-saving=300

1979 1679 300 (15%) MacBook Pro 13,3" ricondizionato con Intel Core i5 quad-core a 2,4GHz e display Retina - Argento

... (more)
```

### Tweepy

The Twitter adapter is using the nice library [Tweepy](https://www.tweepy.org/).

For Refurbot all we need is to [post a status update](https://docs.tweepy.org/en/latest/api.html#API.update_status), but it also handles the authentication gracefully.

## Serverless Framework

The Serverless framework is the heart and soul of this serverless project, and it is used to:

 - Create the infrastructure
 - Build the lambda packages
 - Deploy the code


## Commands and Events

A more detailed overview of the Refurbot architecture.

![Refurbot Architecture](/images/refurbot-architecture-detail.png)

### Step 1

#### Schedule

We are using the CloudWatch Event to fire up an event and trigger the lambda execution:

```yaml
functions:
  run-scheduled:
    handler: refurbot/entrypoints/aws/cloudwatch/events.run_scheduled
    timeout: 10 # sometimes the Apple's refurbished store hangs for a few seconds.
    events:
      - schedule:
          name: run-scheduled
          rate: cron(00 8 ? * MON-SUN *)
          enabled: true
          input:
            commands:
              SearchDeals:
                country: us
                product: mac
```

### Step 2

The lambda function starts and publishes a `SearchDeals` command in the MessageBus:

```python
def run_scheduled(event: Dict, config: Any):

    cmd = commands.SearchDeals(
        country='us',
        product='mac'
    )

    messagebus.handle(cmd)
```

In a real project the lambda should use the `event` data to build the command, but in this sample project we'll just build a `SearchDeals` command.

### Step 3

The MessageBus looks up the right handler and invoke it.


### Step 4 and 5

The handler executes the real business logic: in this case, search the Apple Store end create a `DealsFound` event:

```python
def search_deals(cmd: commands.SearchDeals,
                 uow: UnitOfWork,
                 _: Dict[str, Any]) -> List[events.Event]:

    with uow:
        deals = uow.refurbished_store.search(cmd.country, cmd.product)

        if not deals:
            return [events.DealsNotFound(
                country=cmd.country,
                product=cmd.product,
            )]

        # get the deal, arbitrarily defined as the one with the
        # max saving percentage
        the_best_deal = max(deals, key=lambda deal: deal.saving_percentage)

        return [events.DealsFound(
            country=cmd.country,
            product=cmd.product,
            deals=list(deals),
            best_deal=the_best_deal,
        )]
```

### Step 6 and 7

The MessageBus now handles the `DealsFound` event updating the status on Twitter:

```python
def tweet_deals(event: events.DealsFound,
                uow: UnitOfWork,
                context: Dict[str, Any]):

    with uow:
        text = "Hey, ... [cut]"
        uow.twitter.update_status(text)
```


## The Serverless Advantage

There aren't any process running idle waiting for events consuming resources (CPU, RAM, etc).

The application is started when needed, and when it's done that's it.
