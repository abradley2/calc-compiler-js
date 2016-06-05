var Compiler = require('./lib/Compiler'),
    c = new Compiler()

//var testTemplate = 'SUM(1 - ZERO() - 8, SUM(3, 1, 20), 4)'
var testTemplate = 'SUM(1, 2, 3 - 2)'

var data = [
    {COL_1: 2},
    {COL_1: 7},
    {COL_1: 1},
    {COL_1: 43}
]

var outStack = c.parse( testTemplate )

module.exports = Compiler
