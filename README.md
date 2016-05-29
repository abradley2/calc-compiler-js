**THIS IS A WORK IN PROGRESS**

# JavaScript Calc-Compile

Simple compiler for turning excel-style field calculation strings into
JavaScript functions that can act on data-set collections.

### Purpose

The purpose of this is to allow "excel style" table manipulation by
users who are comfortable writing spreadsheet function strings. Useful in
applications that allow the user to manipulate the data they are seeing (obvious
examples: Microsoft Excel and LibreOffice Calc)

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
var data = {A: 3, B: 7}

data.C = outputFunc( data )
```

Because we've applied our function to data property C

This can be a bit tedious programmatically though.
Normal excel functions simply have you assign an `=SUM(A1, B1)`
in the cell and it's inferred the assignment is to that current column cell.

However, we may wish to do something cleaner than that, since in
terms of pure javascript, we don't have "copy paste" macros to apply
to all cells. This can be tedious:
```
dataSet.map(function (row) {
    row.C = outputFunc_C(row)
    row.D = outputFunc_D(row)
    row.E = outputFunc_E(row)
})
```

You can prefix the `=` assignment with the name of a row to create a macro
that knows which row it is assigning to. This allows a much cleaner:


```
var calcString = 'C=SUM(A, B)'
```

Expressions are evaluated in the order in which they appear in the block, so
you can make compound calculated columns:

```
var calcString = `C=SUM(A, B); D=SUM(C, 24)`
```

And for example, lets say we have a sizeable data set similar to this:
```
var dataSet = [
    {A: 1, B: 3},
    {A: 4, B: 2},
    {A: 8, B: 1}
]
```

Because the assignment tells the function which column it acts on per row,
you may pass the output func via:
```
dataSet.map( outputFunc, dataSet)
```

The C and D property of every item of the dataSet will now be calculation results
of their adjacent columns (represented by properties on the object per iteration)

Here's the result:

```
var dataSet = [
    {A: 1, B: 3, C: 4, D: 28},
    {A: 4, B: 2, C: 6, D: 30},
    {A: 8, B: 1, C: 9, D: 33}
]
```

### Contributing

Open to pulls.

Follow the style guidelines of
[javascript-standard](https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style)
with these two exceptions

1. Indentation is 4 spaces, not 2
2. var declarations seperated by a comma are OK
```
// totally fine
var one = 1,
    two = 2,
    other = 'a string'
```
