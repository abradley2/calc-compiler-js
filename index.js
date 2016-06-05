var Compiler = require('./lib/Compiler'),
    c = new Compiler()

//var testTemplate = 'SUM(1 - ZERO() - 8, SUM(3, 1, 20), 4)'
var testTemplate = 'SUM(1, 2, 3)'

var data = [
    {COL_1: 2},
    {COL_1: 7},
    {COL_1: 1},
    {COL_1: 43}
]

var outStack = c.parse( testTemplate )

console.log(JSON.stringify(outStack))

module.exports = Compiler
