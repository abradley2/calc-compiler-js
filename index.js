var Compiler = require('./lib/Compiler'),
    c = new Compiler()


var testTemplate = 'SUM(COL_100 - 8, AVE(3, 1, 20), 4)'

var data = [
    {COL_1: 2},
    {COL_1: 7},
    {COL_1: 1},
    {COL_1: 43}
]

var outFunc = c.compileTemplate( testTemplate )

data.map( outFunc, data )

module.exports = Compiler
