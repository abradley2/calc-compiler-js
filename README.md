## JavaScript Calc-Compile

Simple compiler for turning excel-style field calculation strings into
JavaScript functions. Also is able to export a "prettied" AST for easily
passing the data to the server as queries via JSON.

### Purpose

The purpose of this is to allow "excel style" table manipulation by
users who are comfortable writing spreadsheet function strings.

### A humble example

```
var c = new Jcalc()

var calcString = "FIELD_3 = ADD(FIELD_1, FIELD_2)"

var outputFunc = c.compile( calcString )
```

Then run the output function against a data set using a `.forEach` or a `.map` with
the context variable set to the collection that is being looped through. This
mutates the collection.

You may sub in your own iteration, so long as it meets the iteration api of the
above methods.

```
var data = [
    {FIELD_1: 3, FIELD_2: 7},
    {FIELD_1: 2, FIELD_2: 20}
]

data.forEach( outputFunc, data )
```

The data set is now:
```
var data = {
    {FIELD_1: 3, FIELD_2: 7, FIELD_3: 10},
    {FIELD_1: 2, FIELD_2: 20, FIELD_3: 22}
}
```

Kewl.

### Hmm.... partial compilation?

The compiler can actual return the AST instead of the final function. It can
then finish compilation of the AST whenever you call it after that.

This means you have an opportunity to manipulate that AST and get _really_
fancy.


One killer feature of this is allowing both the client and the server to
manipulate a data set. 

Let's say we want to add a calculated field to a data set, but we don't have
all the necessary information present in the data set.
