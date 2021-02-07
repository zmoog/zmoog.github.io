---
title: "TIL: how to replace an external Go dependency with a local copy"
date: 2021-02-05T14:54:34+01:00
draft: false
---

## The Problem

You're using a great open source library in your project, and then, one day, you find yourself thinking: 

> "Oh, wouldn't be great if the author just added a tiny little log statement in that function?". 

Yeah, it really would, this would allow me to trace the value of that variable or try a small change.

What can you do: fork the library? Nope. Don't do that.


## Replace it!

You can temporarily replace the original module with a local copy, changing one line in your `go.mod` file.


### Example

Here's a minimal example of a small `go.mod`, the file every Go project uses to handle dependencies:

```
module github.com/zmoog/foo

require (
    github.com/zmoog/bar v0.1.0
)
```

To replace the module `github.com/zmoog/bar` with a local copy located on your local disk, all you need to do is add the a new line with the [replace](https://golang.org/ref/mod#go-mod-file-replace) directive:

```
module github.com/zmoog/foo

replace github.com/zmoog/bar => /Users/zmoog/code/projects/bar

require (
    github.com/zmoog/bar v0.1.0
)
```

That's it! 🥳

Now, when you recompile or run your code, the local copy will be used with all your local changes.


## Conclusion

The `replace` directive is a nice little tool for this use case.

### Notice

Don't ever commit these changes into your repo, they're meant to be transient and should be thrown away after use.

