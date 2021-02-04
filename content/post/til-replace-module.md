---
title: "TIL: how to replace a Go dependency with a local copy"
date: 2021-02-04T05:54:34+01:00
draft: true
---

## The Problem

You're using a great library in your application and then, one day, you find yourself thinking: 

> "Oh, wouldn't be great if the author just added a tiny little log statement in that function?". 

Yeah, it really would.

What can you do: fork the library? Nope. Don't do that.


## Replace it!

You can temporarily replace the original module with a local copy, changing one line in your `go.mod` file.


### Example

Here's a minimal example of a small `go.mod` file:

```
module github.com/zmoog/foo

require (
	github.com/zmoog/bar v0.1.0
)

```

To replace the module `github.com/zmoog/bar` with a local copy located on your local disk, all you need to to is add the [replace](https://golang.org/ref/mod#go-mod-file-replace) directive:

```
module github.com/zmoog/foo

replace github.com/zmoog/bar => /Users/zmoog/code/projects/bar

require (
	github.com/zmoog/bar v0.1.0
)

```


## Conclusion

That's it!

Now, when you'll recompile or run your code, the local copy will be used with all your local changes.
