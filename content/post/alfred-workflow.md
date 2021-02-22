---
title: "Alfred Workflow"
date: 2021-02-21T09:03:23+01:00
draft: true
---


 ## Automate all the things (reducing friction)
 
A story about friction and wasted time

There are lot of big and small tasks we perform on our computers every day. Even when if they are simple, sometimes they carry a small amount of friction and always require some time. If you just do them once, there is no big deal. But, often we do them over and over agin, day in and day out, so their cumulative cost adds up into a not trivial amount.

### I'm skeptical, please give me some numbers

For example, I use an app called [TextExpander](https://textexpander.com/) every day to automatically *expand* abbreviation into snipplets of text I often use throughout the day.

For example, when I type:
 * `;me` TextExpander replaces it with my full name "Maurizio Branca"
 * `;em` with my email address
 * `;pr` with my template for pull requests
 * `;shrug` with `¯\_(ツ)_/¯`


![TextExpander Stats](/images/textexpander-example.gif)


### Numbers

According to TextExpander, since January 1st I saved **47 minutes** just expanding abbreviations into text instead of typing it on my keyboard.

![TextExpander Stats](/images/textexpander-stats.png)

It might or might not feel like a big deal, but actually I saved time AND removed friction from my workflow. Every time a expand a multiple words text or a template, I feel good.

### Numbers

I started with TextExpander because it is kind enough to give me the numbers, but today I want to write about another tool that can save you time and remove friction: Alfred for macOS.


 ## What is Alfred?
 
 ### One application to launch them all

[Alfred](https://www.alfredapp.com) is a desktop [application launcher](https://en.wikipedia.org/wiki/Comparison_of_desktop_application_launchers) for macOS.

There are a lot of launchers for macOS, including the built in [Spotlight](https://en.wikipedia.org/wiki/Spotlight_(software)) from Apple, but Alfred is a special one.

You can use Alfred to launch applications, perform simple calculations, lookup locations using map services, search products on Amazon and more.

![Alfred example](/images/alfred-example.gif)

Can be a really handy and powerful tool, but as developers the real power and most interesting stuff comes from a the Alfred Worflows.

(alfred alternatives on other platforms?)

### Powerpack

Extensions are available only for the users who purchased the [Alfred Powerpack](https://www.alfredapp.com/powerpack/).

 * clipboard history
 * snipplets
 * Apple Music
 * Files
 * Contacts
 * Workflows!
 * and more.

 Clipboard history and contact list are great, but workflows are a game changer.


 ## Workflows

[Workflows](https://www.alfredapp.com/workflows/) are an extentions mechanism that allow third party developers to write their own additional feature that can be triggered and executed from Alfred using a keyword.

![Alfred Workflow Panel](/images/alfred-workflow-panel.png)

Workflows can be written in virtually any language that can write XML, the markup used to communicate between Alfred and the workflow (more on this later).

Today I want to share how to write useful custom workflows using Python.


 ## Introducing Alfred-Workflows

There is probably one framework for every major language out eherem buy the Python based [Alfred-Workflow](https://github.com/deanishe/alfred-workflow) from [deanishe](https://twitter.com/deanishe) is absolutely one of the best ones.

I created multiple workflow over a few months.

 ## Example: ClasseViva

ClasseViva is the electronic register used by a lot of schools here in Italy. 

I build a small workflow using the library https://github.com/zmoog/classeviva-client to access the grades of my older kid during the week, so I can access the latest one with a very fre keystrokes.

![Alfred Workflow ClasseViva](/images/alfred-classeviva.gif)

The alternative was open a new browser tab/window, log into the website, select the grades.


 ## Example: Arduino CLI

Sometime I want to see the details of the Arduino board connected to my laptop, list the installed core or search theough the libraties using the Arduino CLI.

You can browse the final project visiting https://github.com/zmoog/alfred-arduino-cli/.

I always have one or more open terminal, the zsh and reverse search ready, but sometimes all you need is to repeat over over a small subset of recurring actions.

An Alfred workflow is perfect for this kind of stuff.

![Alfred Workflow Arduino CLI](/images/alfred-arduino-cli.gif)


### High level overview

When you type the keyword on Afred then it:

1. triggers the workflow
2. the workflow executes the `arduino-cli` setting the output to JSON format
3. when the `arduino-cli` is finished, the workflow parses the output and buid the response and return it to the Alfred core.


![Alfred Workflow Arduino CLI](/images/alfred-arduino-cli.png)

The Arduino CLI workflow runs the `arduino-cli.py` file using the Python interpreter with a defined set of commands.


![Alfred Workflow Arduino CLI Panel](/images/alfred-arduini-cli-panel.png)

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

### Run the CLI and parse the output

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

and this is the resultin XML produced by Alfred-Workflow:

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

### Invoke

To keep the workflow as simple as possible I used the `--format json` available for most of the CLI commands. The result is returned as a nice JSON that can be easily parsed using the builtin `json` module.

```python
def run_command(cmd):
    from invoke import run
    
    cmd = "./arduino-cli {cmd} --format json".format(cmd=cmd)

    result = run(cmd, hide=True, warn=True)
    if not result.ok:
        raise Exception(result.stdout)

    return json.loads(result.stdout)
```

 ## Conclusion



As nerds, we usually end up building solutions, but BEFORE starting we should always ask ourselves: [it worth the time](https://xkcd.com/1205/)?

