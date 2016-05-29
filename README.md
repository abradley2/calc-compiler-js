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
