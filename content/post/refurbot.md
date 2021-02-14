---
title: "Refurbot: a serverless bot that tweets"
date: 2021-02-13T08:42:11+01:00
draft: true
---

## The Serverless Opportunity

Writing bots is fun. Sometimes it is even useful, but you write a bot most of the time because it is entertaining.

But once you have written one, traditionally, you had to deal with the hassle of keeping them running indefinitely on your computer, on some random Pis, or on an EC2 instance.

Are there other solutions to run a bot? 

Hell, yeah: a serverless bot! ⚡️

Even better, bots are one kind of application that can be run efficiently within most cloud providers' free tiers.

In this article, I'll share with you how I built Refurbot, a sample Twitter bot that every day tweets the best deal available in the refurbished products section of the Apple Store.


## Introducing Refurbot

Every morning at 9 am (CET), Refurbot will wake up and have breakfast. It will then access the Apple Store to fetch the latest deals, find the best one (percentage-wise), and tweet it to its vast audience (it's just me).

![Refurbot Architecture](/images/refurbot-tweet-screenshot.png)


### Architecture

Refurbot is a simple serverless application written in Python. It has been designed using the [clean architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) principles, even if such a simple project should not really deserve this special attention.

![Refurbot Architecture](/images/refurbot-architecture-high-level.png)

Sometimes, we do such things ["just because we can"](https://www.youtube.com/watch?v=WlGIxof7w5I) and it's totally overkill, but in this case I think it's useful to test or practice using simple context and then progressively move up to something more complex (no I'm lying, I just read the two books [Architecture Patterns with Python](https://www.cosmicpython.com/book/) and [Clean Architectures in Python](http://www.pycabook.com) and I want to practice!)

## Commands and Events

A more detailed overview of the Refurbot architecture.

![Refurbot Architecture](/images/refurbot-architecture-detail.png)

### Step 1 — Schedule it


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

The MessageBus looks up the right command handler and invoke it. The command handler contains the business logic to fullfil the command.


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

Each command handler exececution usually created one or more events.

### Step 6 and 7

Now the MessageBus handles the `DealsFound` event, updating the status on Twitter:

```python
def tweet_deals(event: events.DealsFound,
                uow: UnitOfWork,
                context: Dict[str, Any]):

    with uow:
        text = "Hey, ... [cut]"
        uow.twitter.update_status(text)
```



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

Refurbot is using a few libraries:

 * [tweepy](https://www.tweepy.org), to post status updates to Twitter
 * [click](https://click.palletsprojects.com), to build a [command line version of che bot].
 * [pytest](http://pytest.org) and [pytest-mock](https://pypi.org/project/pytest-mock/), for testing.
 
But there is another one that is dear to me (just becouse I'm the author).

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



## Serverless Framework

The Serverless framework is the heart and soul of this serverless project, and it is used to:

 - Create the infrastructure
 - Build the lambda packages
 - Deploy the code


## Wrapping up

Serverless is a good fit for bots: there aren't any process running idle waiting for events consuming resources (CPU, RAM, etc). The application is started when needed, and when it's done that's it.

But you know: there ain't no such thing as a free lunch. Serverless solutions come with their own sets of trafe offs, like lambda functions cold start, potential "vendor lock in", and more.



### The GitHub repository is wide open

Refurbot is available as a ready to deploy project on GitHub, visit https://github.com/zmoog/refurbot to learn more.
