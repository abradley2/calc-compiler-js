var Compiler = require('./lib/Compiler'),
    c = new Compiler()


var testTemplate = 'SIN( MAX(2, 3) / 3 * PI)'

var data = [
    {COL_1: 2},
    {COL_1: 7},
    {COL_1: 1},
    {COL_1: 43}
]

var outFunc = c.compileTemplate( testTemplate )

data.map( outFunc, data )

module.exports = Compiler
