---
title: "On Writing Alfred Workflows in Python"
date: 2021-03-01T07:54:00+01:00
draft: true
---


## Automate all the things

### A story about friction and wasted time

There are a lot of big and small tasks we perform on our computers every single day. Even when they are simple, they sometimes carry a tiny amount of friction and always require time to complete. If you just do them once, there is no big deal. But, often, we do them over and over again, day in and day out, so their cumulative cost adds up into a not trivial amount.


### 🤨 Hey, I'm pretty skeptical, please give me something more tangible

I use an app called [TextExpander](https://textexpander.com/) every day to automatically *expand* abbreviation into snippets of text I often use throughout the day.

For example, when I type:
 * `;me` TextExpander replaces it with my full name, "Maurizio Branca"
 * `;em` with my email address
 * `;pr` with my favourite [template for pull-requests](https://gist.github.com/zmoog/40e989c7e2a4450a4ee5d8b6d2833f04)
 * `;shrug` with `¯\_(ツ)_/¯`

![TextExpander Stats](/images/textexpander-example.gif)


#### The Raw Numbers

According to TextExpander, in the last 50 days, I saved **47 minutes** just expanding abbreviations into the text instead of typing it on my keyboard.

![TextExpander Stats](/images/textexpander-stats.png)

It might or might not feel like a big deal, but actually, I saved time AND removed friction from my workflow. And every time a expand a multiple words text or a template, I feel *really* good.


#### But TextExpander is not for developers!

I started with TextExpander because it is kind enough to give us the numbers, but today I want to write about another tool that can save you time and remove friction: Alfred, for macOS.


 ## What is Alfred?

 ### One application to launch them all

[Alfred](https://www.alfredapp.com) is a desktop [application launcher](https://en.wikipedia.org/wiki/Comparison_of_desktop_application_launchers) for macOS.

It's not the only one: there are a good number of launchers for macOS: [LaunchBar](https://www.google.it/search?q=launchbar), the venerable [Quicksilver](https://qsapp.com) and the built-in [Spotlight](https://en.wikipedia.org/wiki/Spotlight_(software)) from Apple. 

Alfred is my favorite.


### Features

You can use Alfred to launch applications, perform simple calculations, lookup locations using map services, search products on Amazon, or anything else on Google.

![Alfred example](/images/alfred-example.gif)

The already mentioned features can be a convenient and useful tool, but the most powerful and impressive stuff comes out of the Powerpack if you have some development skills.

If you're willing to [pay £29.00](https://www.alfredapp.com/shop/), you'll get the real value out of it.


### 💰⚡️ The Powerpack

Here's what you get if you purchase the [Alfred Powerpack](https://www.alfredapp.com/powerpack/).

 * **Clipboard history** — you can search and paste again up to three months of text copied in the pasteboard (it's how macOS call the clipboard)
 * **Snippets** — a basic TextExpander built-in Alfred
 * **Files**
 * **View Contacts** — search end open your contacts, great for lookup a phone number or an email address in an instant
 * **Workflows**
 * and more.

Clipboard history is a killer feature to me, but Workflows are a real game-changer.


 ## Workflows

[Workflows](https://www.alfredapp.com/workflows/) are an extension mechanism that allows third-party developers to write their own additional feature that can be plugged in Alfred, triggered, and executed from Alfred typing a short keyword.

![Alfred Workflow Panel](/images/alfred-workflow-panel.png)

Workflows can be written in virtually any language that can write XML, the default markup used to communicate between Alfred and the workflow (more on this later).

Today I want to share how to write useful custom workflows using Python.


 ## Introducing Alfred-Workflows

There is probably one framework to build Alfred workflows for every popular language out there, but the Python-based [Alfred-Workflow](https://github.com/deanishe/alfred-workflow) from [deanishe](https://twitter.com/deanishe) absolutely stands out for its features and good documentation.

Over the last few months, I created multiple workflows to scratch an itch and solve practical problems, and it's been delightful.


 ## Example: ClasseViva

[ClasseViva](https://web.spaggiari.eu/sdf/app/default/cvv.php?vista=scheda_prodotto) is the electronic class register used by a lot of schools here in Italy. 

I build this small workflow using my own library https://github.com/zmoog/classeviva-client to access my older kid's grades with very few keystrokes (four keys: `<alt> <space> <cv> <v>` to summon Alfred and type `cv` the keyword for this shortcut).

![Alfred Workflow ClasseViva](/images/alfred-classeviva.gif)

The alternative was to open a new browser tab/window, log into the website, select the grades.


 ## Example: Arduino CLI

Sometimes I need to peek at the details of one of the Arduino boards connected to my laptop, or list the installed core or search through the installed libraries using the Arduino CLI.

I always have a terminal open on my Mac running `zsh,` and I use reverse search a lot, but a well-prepared launcher app can be even quicker.

Launchers are great when you have a limited set of recurring actions you repeat every day (or maybe even every hour or few minutes) you can optimize for.

An Alfred workflow is perfect for this kind of stuff.

![Alfred Workflow Arduino CLI](/images/alfred-arduino-cli.gif)


### Source code

You can browse the final project by visiting https://github.com/zmoog/alfred-arduino-cli/.


### Are you on Linux?

If you're not on Mac, give https://github.com/umbynos/arduino_cli a try; it's a [Python plugin](https://github.com/albertlauncher/plugins/blob/master/python/README.md) built by my dear teammate and friend [@umbynos](https://github.com/umbynos/) for the [Albert](https://albertlauncher.github.io) launcher.


### High-level overview
Let's get a general idea about how workflows work in Alfred, using this as an example.

When you type the keyword on Alfred, then it:

1. Alfred triggers the workflow.
2. The workflow executes the `arduino-cli` file with the input prepared by the workflow.
3. the `arduino-cli` runs the command and writes the result to the standard output using the JSON format.
4. When the `arduino-cli` finishes, the workflow parses the JSON output and builds the response to return to the Alfred core.

![Alfred Workflow Arduino CLI](/images/alfred-arduino-cli.png)


Check [arduino-cli.py](https://github.com/zmoog/alfred-arduino-cli/blob/main/arduino-cli.py) out to see how the Arduino CLI workflow has been implemented.


### How to Create a new Workflow

If you want to start creating your own workflows in Python using Alfred-Workflows, your best option is to start with the great  [Tutorial Part 1: Creating a Basic Pinboard Workflow](https://www.deanishe.net/alfred-workflow/tutorial_1.html).

This short and focused tutorial explains how to build a simple Pinboard workflow from scratch.


### 1. Trigger the Workflow

I used a script filter to trigger the workflow by typing `cli` on Alfred.

![Alfred Workflow Arduino CLI Panel](/images/alfred-arduino-cli-panel.png)

When I select one of the actions available, Alfred will run the Python script `python arduino-cli.py core list {query}` behind the scene, replacing `{query}` with the text I typed and then waiting for the script to execute and return the response XML.


### 2. The Workflow Executes

The script is a regular Python script you can also run on the terminal for testing and troubleshooting.

```python
def main(wf):
  
    # build argument parser to parse script args and collect their
    # values
    parser = argparse.ArgumentParser()

    # add a required command and save it to 'command'
    parser.add_argument('command') 
    # add a required sub command and save it to 'sub_command'
    parser.add_argument('subcommand', nargs='?', default='none')
    # add an optional query and save it to 'query'
    parser.add_argument('query', nargs='?', default=None)

    # parse the script's arguments
    args = parser.parse_args(wf.args)

    Handler(args, wf).run()


if __name__ == u"__main__":
    wf = Workflow(libraries=["./libs"])
    log = wf.logger
    sys.exit(wf.run(main))

```

The Alfred-Workflow library does the heavy-duty of offering a nice API to indirectly produce the XML Alfred requires to work with workflows, plus many useful goodies.

 * Fuzzy, Alfred-like search/filtering with diacritic folding
 * Simple, persistent settings
 * Simple, auto-expiring data caching
 * Keychain support for secure storage (and syncing) of passwords, API keys, etc.
 * Lightweight web API with a requests-like interface

And more, check out the [full list of features](https://www.deanishe.net/alfred-workflow/index.html#features).


### 3. Run the actual arduin-cli binary

The real work is performed by the [Arduino CLI](https://github.com/arduino/arduino-cli).

The workflow uses [Invoke](http://www.pyinvoke.org/installing.html) to run the CLI binary, collect and parse the JSON returned in the standard output.


#### Invoke

To keep the workflow as simple as possible, I used the `--format json` option available for most CLI commands. The result is returned as a nice JSON that can be easily parsed using the built-in `json` module.

```Python
def run_command(cmd):
    from invoke import run
    
    cmd = "./arduino-cli {cmd} --format json".format(cmd=cmd)

    result = run(cmd, hide=True, warn=True)
    if not result.ok:
        raise Exception(result.stdout)

    return json.loads(result.stdout)
```


### 4. Build a response for Alfred

Finally, the workflow uses the CLI data to build the Alfred items that drive its UI.

```python
    def handle_version_none(self):
        
        version = run_command("version")

        self.wf.add_item(title=version["VersionString"],
                         subtitle='version')
        self.wf.add_item(title=version["Commit"],
                         subtitle='Commit')
        self.wf.add_item(title=version["Status"],
                         subtitle='Status')

        
        # Send the results to Alfred as XML
        self.wf.send_feedback()
```

And finally, when the Python script is done, this is what Alfred get back:

```xml
<?xml version="1.0" encoding="utf-8"?>
<items>
    <item valid="no">
        <title>0.16.0</title>
        <subtitle>version</subtitle>
    </item>
    <item valid="no">
        <title>c977a2382c2e7770b3eedc43e6a9d41f4a6c3483</title>
        <subtitle>Commit</subtitle>
    </item>
    <item valid="no">
        <title>alpha</title>
        <subtitle>Status</subtitle>
    </item>
</items>%  
```


 ## Conclusion

If you spend hours a day sitting in front of a computer for work, it's hard to imagine you don't have a small activity you have to repeat over and over that could benefit some automation.

[Is it worth the time](https://xkcd.com/1205/)?

The next time you feel that impalpable sense of discomfort for having to repeat a tedious task one more time, well, think about if you can automate it using your language of choice. Build it and then make it super convenient to run from the slick Alfred UI, turning it into an Alfred Workflow.

Start small with something you need to "fix", like opening the same site 1-3 times a day to check some information you need or generate UUIDs on the fly, or a password, all with less than a handful of keystrokes.

And have fun along the way.


## Music

This post has been written listening to [Black Market](https://open.spotify.com/album/4COZn5okauxP5luXkwEPLd?si=6aSBpgopSNCpm8w9OgGy6w) by [Weather Report](https://open.spotify.com/artist/162DCkd8aDKwvjBb74Gu8b?si=6Ybw6IUlQbuLfxD1M6d2Tw).
  