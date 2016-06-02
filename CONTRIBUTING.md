The AST generates a reverse-polish notation sequence.

That is
`3 + 4 * 2`
becomes
`4 2 * 3 +`

These are wrapped in an object that gives more details about
the primitive/operator/function in the sequence. All of these
objects then comprise an array of nodes.


 
Because this allows the compiler to evaluate from left-to-right easily.

The end result of the above looks like
```
[
    {

        type: 'OPERATION',
        operator: '*',
        args: [
            {
                type: 'CONST',
                value:
            }
        ]

    }
]
```