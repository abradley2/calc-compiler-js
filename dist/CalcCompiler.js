(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.CalcCompiler = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./lib/Compiler":2}],2:[function(require,module,exports){
var grammar = require('./grammar'),
    Tokenizer = require('./Tokenizer'),
    Tree = require('./Tree'),
    func = require('./func'),
    assign = require('./util/assign')

function Compiler () {

    this.tokenizer = new Tokenizer( grammar )

}

assign(Compiler.prototype, {

    compileTemplate: function (template) {

        var tokens = this.tokenizer.getTokens(template)

        var tree = new Tree(tokens)

        var nodes = tree.parse()

        /*
            now use the functions in /func
            to sub in for function nodes and
            create a working expression
        */

        console.log('nodes = ',JSON.stringify(nodes))

        /*
            Finally, return the output function
        */
        return function (item) {
            return item
        }

    }

})

module.exports = Compiler

},{"./Tokenizer":3,"./Tree":4,"./func":7,"./grammar":8,"./util/assign":9}],3:[function(require,module,exports){
var assign = require('./util/assign')

function Tokenizer (grammar) {
    this.grammar = grammar
}

assign(Tokenizer.prototype, {

    getTokens: function (tpl) {
        var template = tpl,
            stack = []

        while (template.length > 0) {
            template = this.yieldNextToken(template, stack)
        }

        return stack

    },

    yieldNextToken: function (template, stack) {

        this.grammar.some(function (grammarObj) {

            var match = grammarObj.test.exec(template)

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

},{"./util/assign":9}],4:[function(require,module,exports){
var assign = require('./util/assign'),
    last = require('./util/last')

function Tree (tokens) {
    this.tokens = tokens
}

assign(Tree.prototype, {

    /*
        Because of what we are compiling, we have no more than a single
        block of expressions. Makes this task much easier than it would
        be. For future reference should this be expanded to support
        multiple blocks, this function should be renamed to 'parseBlock'
        and called internally from the master 'parse' function
    */
    parse: function () {

        var root = {
            type: 'Root',
            nodes: []
        }

        // create a clone of the tokens array so it is not mutated
        var tokens = this.tokens.slice()

        // remove whitespace tokens. They aren't relevant
        this.removeWhitespaceTokens(tokens)

        while (tokens.length > 0) {

            root.nodes.push(
                this.getExpressionNode(tokens)
            )

        }

        return root
    },

    /*
        function for removing all whitespace token
    */
    removeWhitespaceTokens: function (tokens) {
        tokens = tokens.filter(function (token) {
            return token.name !== 'WHITESPACE'
        })
        return tokens
    },


    getExpressionNode: function (tokens) {

        // Shunting-yard algorithm
        // https://en.wikipedia.org/wiki/Shunting-yard_algorithm
        var stack = [],
            output = [],
            funcDepth = 0

        while (tokens.length > 0) {

            var token = tokens.shift(),
                next = tokens[0]

            switch (token.name) {
                case 'OTHER':
                    
                    if (next && next.name === 'BEG_ARGS') {
                        stack.push({
                            type: 'FUNC',
                            funcDepth: ++funcDepth,
                            content: token.found
                        })
                    } else {

                        output.push({
                            type: 'CONST',
                            funcDepth: funcDepth,
                            content: token.found
                        })

                    } 

                    break

                case 'BEG_ARGS':

                    stack.push({
                        type: 'BEG_ARGS',
                        content: token.found
                    })

                    break

                case 'END_ARGS':
                    while ( last(stack) && last(stack).type !== 'BEG_ARGS' ) {
                        output.push( stack.pop() )
                    }
                    if ( last(stack) && last(stack).type === 'BEG_ARGS') {
                        stack.pop()
                    }
                    if ( last(stack) && last(stack).type === 'FUNC') {
                        --funcDepth
                        output.push( stack.pop() )
                    }
                    break

                case 'ARG_SEP':
                    /*
                        Until the token at the top of the stack is a left parenthesis, 
                        pop operators off the 
                        stack onto the output queue. 
                    */
                    while ( last(stack) && last(stack).type !== 'BEG_ARGS' ) {
                        output.push( stack.pop() )
                    }
                    if ( stack.length === 0 || last(stack).type !== 'BEG_ARGS' ) {
                        throw new Error('Missing openining  ( in arguments list')
                    }

                    break

                case 'OPERATOR':
                    var precedence, associative
                    if (token.found === '*' || token.found === '/') {
                        precedence =3
                        associative = 'left'
                    } 
                    if (token.found === '+' || token.found === '-') {
                        precedence = 2
                        associative = 'left'
                    }

                    /*
                        while there is an operator token o2, at the top of the operator stack and either
                    */
                    while (last(stack) && last(stack).type === 'operator') {
                        // o1 is left-associative and its precedence is less than or equal to that of o2, or...
                        if (associative === 'left' && precedence <= last(stack).precedence ) {
                            output.push( stack.pop() )
                        // o1 is right associative, and has precedence less than that of o2, 
                        } else if (associative === 'right' && precedence < last(stack).precedence) {
                            output.push( stack.pop() )
                        } else {
                            break
                        }
                    }

                    stack.push({
                        type: 'operator',
                        associative: associative,
                        precedence: precedence,
                        content: token.found
                    })
                    break
                default:
                    break

            }

        }

        while (stack.length !== 0) output.push( stack.pop() )

        return output

    }

})

module.exports = Tree

},{"./util/assign":9,"./util/last":11}],5:[function(require,module,exports){
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
function SUM () {
    var retVal = 0

    for (var i = 0; i < arguments.length; i++) retVal += arguments[i]

    return retVal
}

module.exports = SUM

},{}],7:[function(require,module,exports){
module.exports = {
    'SUM': require('./SUM')
}

},{"./SUM":6}],8:[function(require,module,exports){
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
        test: new RegExp(/^[\*\/\+\-]/)
    })

    // add in a regex to match any whitespace
    regexes.push({
        name: 'WHITESPACE',
        regexString: '[\ \t\r\n]+',
        test: new RegExp(/^[\ \t\r\n]+/)
    })

    // create a regeSTRINGx that matches anything apart from keywords and whitespace
    var allRegex = pluck(regexes, 'regexString').join('|')
    regexes.push({
        name: 'OTHER',
        test: new RegExp('^((?!' + allRegex + ').)*')
    })

    return regexes

}

module.exports = grammar(delimiters)

},{"./configure/delimiters":5,"./util/getEscaped":10,"./util/pluck":12}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
function getEscaped (str) {
    /*
        basically any special character I want to escape, preceded by a \
        should escape [], (), {}, +, =, -, ^, $, &, |, and !
    */
    var escapes = /[\^\$\\\/\[\]\{\}\(\)\|\+\=\-\!]/g;

    return str.replace(escapes,"\\$&");
}

module.exports = getEscaped

},{}],11:[function(require,module,exports){
function last (collection) {
    return collection[collection.length - 1]
}

module.exports = last
},{}],12:[function(require,module,exports){
function pluck (collection, prop) {

    return collection.map(function (item) {
        return item[prop]
    })

}

module.exports = pluck

},{}]},{},[1])(1)
});