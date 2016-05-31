(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.CalcCompiler = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Compiler = require('./lib/Compiler'),
    c = new Compiler()


var testTemplate = '52+ADD(COL_1+2,7)*3'

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

            /*
                Once there's at least 2 elements on the stack, give each stack
                element a reference to the previous one for convenience
            */
            if (stack.length >= 2) {
                // for now, I don't think I need this
                //stack[stack.length - 1].previous = stack[stack.length - 2]

            }

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
var assign = require('./util/assign')

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

    /* 
        Get a singular function argument.
        Called by getFunctionArgs
    */
    getFunctionArgs: function (tokens, _args) {
        args = args || []

        var token = tokens.shift()

        switch (token.name) {
            case 'ARG_SEP':
                return this.getFunctionArgs(tokens, args)
            case 'OTHER':
                args.push( this.getOtherNode(token, tokens) )
                return this.getFunctionArgs(tokens, args)
            case 'BEG_ARGS':
                args.push( this.getExpressionNode(tokens) )
                return this.getFunctionArgs(tokens, args)
            case 'END_ARGS':
                return args
            default:
                throw new Error('ERROR: unexpected end of arguments', token)
        }
        
    },


    /*
        Get a function node
        Called when an identifier is followed by a (
        which signifies the beginning of an argument list or invocation
    */
    getFunctionNode: function (token, tokens) {
        var begArgToken = tokens.shift()
        console.log('GOT A FUNCTION', token)

        // get all the args until the end parens is found
        var args = this.getFunctionArgs(tokens)

        return {
            type: 'function',
            // nodes can be constants or other functions
            nodes: []
        }

    },

    /*
        Get a constant node
        Called when a col/row lookup (identifier not followed by function args),
        string, or number is found
    */
    getConstantNode: function (token, tokens) {
        var next = tokens[0]
        console.log('next = ',next)
        if (next && next.name === 'BEG_ARGS') {

            return this.getFunctionNode(token, tokens)

        } else {

            return {
                type: 'constant',
                content: token.found,
                // constants do not have nodes
                nodes: null
            }

        }

    },

    getOtherNode: function (token, tokens) {
        // order is important here
        if ( token.found.match(/^\d/) ) {
        
            return this.getConstantNode(token, tokens)
        
        } else if ( token.found.match(/^\w/) ) {
        
            return this.getIdentifierNode(token, tokens)
        
        } else if ( token.found.match(/^"/) ) {
        
            return this.getConstantNode(token, tokens)

        } else {

            throw new Error('ERROR: unidentified token: ', token)

        }

    },

    getIdentifierNode: function (token, tokens) {
        var next = tokens[0]

        if (next && next.name === 'BEG_ARGS') {
            return this.getFunctionNode(token, tokens)
        } else {
            return {
                type: 'IDENTIFIER',
                content: token.found,
                nodes: null
            }
        }


    },

    getExpressionNode: function (tokens) {

        // http://stackoverflow.com/questions/13421424/how-to-evaluate-an-infix-expression-in-just-one-scan-using-stacks#answer-16068554
        var operators = [],
            operands = [],
            expressionEnd = false

        while (tokens.length > 0 && !expressionEnd) {

            var token = tokens.shift()

            //if character is operand or (. push on the operandStack
            switch (token.name) {
                case 'OTHER':
                    operands.push( this.getOtherNode(token, tokens) )
                    break
                case 'BEG_ARGS':

                    break
                case 'END_ARGS':

                    break
                default:
                    break

            }

        }

        // if character is operand or (. push on the operandStack
        return {
            type: 'expression',
            assignsTo: null,
            // nodes can be functions or constants
            nodes: {
                operators: operators,
                operands: operands
            }
        }

    }

})

module.exports = Tree

},{"./util/assign":9}],5:[function(require,module,exports){
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

},{"./configure/delimiters":5,"./util/getEscaped":10,"./util/pluck":11}],9:[function(require,module,exports){
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
function pluck (collection, prop) {

    return collection.map(function (item) {
        return item[prop]
    })

}

module.exports = pluck

},{}]},{},[1])(1)
});