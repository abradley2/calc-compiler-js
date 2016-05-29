(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.CalcCompiler = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var compiler = require('./lib/compiler'),
    c = new compiler()


var testTemplate = '5 + ADD(COL_1 + 2 , 7) * 3'

c.compileTemplate( testTemplate )

module.exports = compiler

},{"./lib/compiler":4}],2:[function(require,module,exports){
var assign = require('./util/assign')

function Tokenizer (grammar) {
    this.grammar = grammar
}

assign(Tokenizer.prototype, {

    getTokens: function (tpl) {
        var template = tpl,
            stack = []

        while (template.length > 0){
            template = yieldNextToken(template, stack)

            /*
                Once there's at least 2 elements on the stack, give each stack
                element a reference to the previous one for convenience
            */
            if (stack.length >= 2) {

                stack[stack.length - 1].previous = stack[stack.length - 2]

            }

        }

    },

    yieldNextToken: function (template, stack) {

        this.grammar.some(function (grammarObj) {

            var match = grammarObj.test.exec(tpl)

            if (match) {
                template = template.replace(grammarObj.test, '')
                stack.push({
                    name: grammarObj.name,
                    found: match[0]
                })
                return true
            }

        })

        return template
    }

})

module.exports = Tokenizer

},{"./util/assign":7}],3:[function(require,module,exports){
var assign = require('./util/assign')

function Node (type, token) {
    this.type = type
    this.token = token

    if (type === 'OPERATOR') {
        this.precedence = {
            '+': 0,
            '-': 0,
            '/': 1,
            '*': 1
        }[token.found]
    }

}

function tree (tokens) {

    var root = {
        type: 'Root',
        nodes: []
    }

    // http://stackoverflow.com/questions/13421424/how-to-evaluate-an-infix-expression-in-just-one-scan-using-stacks#answer-16068554
    var operators = [],
        operands = []

    while (tokens.length > 0) {
        var token = tokens.shift()
        // if character is operand or (. push on the operandStack
        switch (token.name) {
            case 'OTHER':
                operands.push( new Node('OTHER', token) )
                break
            case 'ARG_SEP':
                operators.push( new Node('ARG_SEP', token) )
                break
            case 'OPERATOR':
                operators.push( new Node('OPERATOR', token) )
                break
            case 'GET_VAR':
                operands.push( new Node('GET_VAR', token) )
                break
            case 'BEG_ARGS':
                operands.push( new Node('BEG_ARGS', token) )
                break
            case 'END_ARGS':
                operands.push( new Node('END_ARGS', token) )
                break
            default:
                break
        }
    }

    console.log('operators = ',operators)
    console.log('operands = ',operands)

}

module.exports = tree

},{"./util/assign":7}],4:[function(require,module,exports){
var grammar = require('./grammar'),
    Tokenizer = require('./Tokenizer'),
    TreeParser = require('./TreeParser'),
    assign = require('./util/assign')

function Compiler () {

    this.tokenizer = new Tokenizer( grammar )

    this.treeParser = new TreeParser()

}

assign(Compiler.prototype, {

    compileTemplate: function (template) {

        var tokens = this.tokenizer.getTokens(template),
            ast = tree(tokens)

    }

})



module.exports = compiler

},{"./Tokenizer":2,"./TreeParser":3,"./grammar":6,"./util/assign":7}],5:[function(require,module,exports){
var delimiters = {
    BEG_ARGS: '(',
    END_ARGS: ')',
    END_EXPR: ';',
    USE_VAR: '$',
    ARG_SEP: ',',
    ASSIGN: '='
}

module.exports = delimiters

},{}],6:[function(require,module,exports){
var getEscaped = require('./util/getEscaped'),
    delimiters = require('./configure/delimiters'),
    pluck = require('./util/pluck')

function delimiterToRegex (name, val) {
    var regexString = getEscaped(val)

    return {
        name: name,
        regexString: regexString,
        test: new RegExp( '^' + regexString )
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
        test: new RegExp('^[\*\/\+\-]')
    })

    regexes.push({
        name: 'INT',
        regexString: '[\d]+',
        test: new RegExp('^[\d]+')
    })

    regexes.push({
        name: 'STRING',
        regexString: '[\w]+',
        test: new RegExp('^[\w]+')
    })

    // add in a regex to match any whitespace
    regexes.push({
        name: 'WHITESPACE',
        regexString: '[\ \t\r\n]+',
        test: new RegExp('^[\ \t\r\n]+')
    })

    // create a regex that matches anything apart from keywords and whitespace
    var allRegex = pluck(regexes, 'regexString').join('|')
    regexes.push({
        name: 'OTHER',
        test: new RegExp('^((?!' + allRegex + ').)*')
    })

    return regexes

}

module.exports = grammar(delimiters)

},{"./configure/delimiters":5,"./util/getEscaped":8,"./util/pluck":9}],7:[function(require,module,exports){
function assign (target, source) {

    for (key in source) {

        // make sure only owned properties of the source are assigned
        if ( Object.prototype.hasOwnProperty.call(source, key) ) {
            target[key] = source[key]
        }

    }

    return target

}

module.exports = assign

},{}],8:[function(require,module,exports){
function getEscaped (str) {
    /*
        basically any special character I want to escape, preceded by a \
        should escape [], (), {}, +, =, -, ^, $, &, |, and !
    */
    var escapes = /[\^\$\\\/\[\]\{\}\(\)\|\+\=\-\!]/g;

    return str.replace(escapes,"\\$&");
}

module.exports = getEscaped

},{}],9:[function(require,module,exports){
function pluck (collection, prop) {

    return collection.map(function (item) {
        return item[prop]
    })

}

module.exports = pluck

},{}]},{},[1])(1)
});