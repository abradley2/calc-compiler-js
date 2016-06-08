var getEscaped = require('./util/getEscaped'),
    delimiters = require('./configure/delimiters'),
    pluck = require('./util/pluck')

function delimiterToRegex (name, val) {
    var regexString = getEscaped(val)

    return {
        name: name,
        regexString: regexString,
        test: new RegExp( '^(' + regexString + ')')
    }
}

var grammar = function (delimiters) {

    var regexes = []

    Object.keys(delimiters).forEach(function (name) {
        regexes.push(
            delimiterToRegex(name, delimiters[name] )
        )
    })

    regexes.push({
        name: 'OPERATOR',
        regexString: '[\*\/\+\-]',
        test: new RegExp(/^([\*\/\+\-])/)
    })

    // add in a regex to match any whitespace
    regexes.push({
        name: 'WHITESPACE',
        regexString: '[\ \t\r\n]+',
        test: new RegExp(/^([\ \t\r\n]+)/)
    })

    // add in regex to get double-quoted string
    regexes.push({
        name: 'STRING',
        regexString: '"(?:[^"\\]|\\.)*"',
        test: new RegExp(/^"((?:[^"\\]|\\.)*)"/)
    })

    // add in regex to get numbers
    regexes.push({
        name: 'NUMBER',
        regexString: '\d+(\.\d+)?',
        test: new RegExp(/^(\d+(\.\d+)?)/)
    })

    regexes.push({
        name: 'IDENTIFIER',
        regexString: '[A-Za-z_]{1}[A-Za-z0-9_]*',
        test: new RegExp(/^([A-Za-z_]{1}[A-Za-z0-9_]*)/)
    })

    return regexes

}

module.exports = grammar(delimiters)
