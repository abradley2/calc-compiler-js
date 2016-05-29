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

var calcString = "=SUM(A, B)"

var outputFunc = c.compile( calcString )
```

**TODO: finish documentation**  

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
