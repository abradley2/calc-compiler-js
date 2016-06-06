var Compiler = require('./lib/Compiler'),
    c = new Compiler()

//var testTemplate = 'SUM(1 - ZERO() - 8, SUM(3, 1, 20), 4)'
var testTemplate = 'SUM(1, 2 * 3)'

var data = [
    {A: 2, B: 3},
    {A: 7, B: 8},
    {A: 1, B: 1},
    {A: 43, B: 19}
]

var outStack = c.parse( testTemplate )

var outFunc = c.generate( outStack )

module.exports = Compiler
