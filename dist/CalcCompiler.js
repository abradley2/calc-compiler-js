(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.CalcCompiler = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Compiler = require('./lib/Compiler'),
    c = new Compiler()

//var testTemplate = 'SUM(1 - ZERO() - 8, SUM(3, 1, 20), 4)'
var testTemplate = 'SUM(1, 2 * 3)'

var data = [
    {COL_1: 2},
    {COL_1: 7},
    {COL_1: 1},
    {COL_1: 43}
]

var outStack = c.parse( testTemplate )

module.exports = Compiler

},{"./lib/Compiler":2}],2:[function(require,module,exports){
var grammar = require('./grammar'),
    Tokenizer = require('./Tokenizer'),
    Tree = require('./Tree'),
    func = require('./func'),
    assign = require('./util/assign'),
    omit = require('./util/omit'),
    getIndexBy = require('./util/getIndexBy'),
    last = require('./util/last')

var funcMap = {
    '-': 'DIFF',
    '+': 'SUM',
    '*': 'PROD',
    '/': 'QUOT',
    '^': 'POW'
}

function cleanStackNode (node) {
    return omit(node, 'funcDepth')
}

function Compiler () {

    this.tokenizer = new Tokenizer( grammar )

}

assign(Compiler.prototype, {

    /*
        Small issue with RNP is it has trouble dealing with functions that
        take a variable amount of arguments. So in the Shunting yard 
        process in the Tree generator, a funcDepth attribute was added while
        parsing the arguments to keep track of which args belonged to which 
        function
    */
    _getFunctionArgs: function (funcNode, operands) {
        var argIdx = getIndexBy(operands, {funcDepth: funcNode.funcDepth}),
            args = []

        if (argIdx !== -1) {
            args = operands.splice(argIdx)
        }

        return args
    },

    parse: function (template) {

        var tokens = this.tokenizer.getTokens(template),
            tree = new Tree(tokens),
            nodes = tree.parse()

        var operands = [],
            stack = []

        console.log('NODES = ',nodes)

        while (nodes.length > 0) {
            
            var node = nodes.shift(),
                args = []

            switch (node.type) {
                case 'CONST':
                    operands.push({
                        type: 'CONST',
                        funcDepth: node.funcDepth,
                        content: node.content
                    })
                    break
                case 'FUNC':
                    stack.push({
                        type: 'FUNC',
                        content: node.content,
                        args: this._getFunctionArgs(node, operands)//args.map(cleanStackNode)
                    })
                    break
                case 'OPERATOR':
                    /*
                        Convert operators to appropriate functions
                    */
                    stack.push({
                        type: 'FUNC',
                        content: funcMap[node.content],
                        args: operands.splice(0)//args.map(cleanStackNode)
                    })
                    break
                default:
                    break
            }
        }

        return stack

    },

    generate: function () {
        /* 
            Going to omit the actual compilation to a string. 
            This is best used to create and use functions in 
            memory. 

            Eval is evil.
        */
    }

})

module.exports = Compiler

},{"./Tokenizer":3,"./Tree":4,"./func":12,"./grammar":13,"./util/assign":14,"./util/getIndexBy":16,"./util/last":18,"./util/omit":19}],3:[function(require,module,exports){
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

},{"./util/assign":14}],4:[function(require,module,exports){
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

        // create a clone of the tokens array so it is not mutated
        var tokens = this.tokens.slice()

        // remove whitespace tokens. They aren't relevant
        this.removeWhitespaceTokens(tokens)

        return this.getExpressionNode(tokens)
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
            arity = []

        while (tokens.length > 0) {

            var token = tokens.shift(),
                next = tokens[0]

            switch (token.name) {
                case 'OTHER':
                    
                    if (next && next.name === 'BEG_ARGS') {
                        arity.push(1)
                        stack.push({
                            type: 'FUNC',
                            content: token.found
                        })
                    } else {

                        output.push({
                            type: 'CONST',
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
                        var func = stack.pop()
                        func.arity = arity.pop()
                        output.push( func )
                    }
                    break

                case 'ARG_SEP':
                    if (arity.length > 0) {
                        ++arity[arity.length - 1]
                    } else {
                        throw new Error('Unexpected comma outside argument list')
                    }

                    /*
                        Until the token at the top of the stack is a left parenthesis, 
                        pop operators off the 
                        stack onto the output queue. 

                        An argument separator essentially works as a closing parentheses
                        that does not terminate the parsing of function arguments
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
                        precedence = 3
                        associative = 'left'
                    } 
                    if (token.found === '+' || token.found === '-') {
                        precedence = 2
                        associative = 'left'
                    }

                    /*
                        while there is an operator token o2, at the top of the operator stack and either
                    */
                    while (last(stack) && last(stack).type === 'OPERATOR') {
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
                        type: 'OPERATOR',
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

},{"./util/assign":14,"./util/last":18}],5:[function(require,module,exports){
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
var assign = require('../util/assign')

function DIFF (args, ctx) {

}

assign(DIFF.prototype, {

    compile: function () {

    }

})

module.exports = DIFF

},{"../util/assign":14}],7:[function(require,module,exports){
var assign = require('../util/assign')

function POW (args, ctx) {

}

assign(POW.prototype, {

    compile: function () {

    }

})

module.exports = POW

},{"../util/assign":14}],8:[function(require,module,exports){
var assign = require('../util/assign')

function PROD (args, ctx) {

}

assign(PROD.prototype, {

    compile: function () {

    }

})

module.exports = PROD

},{"../util/assign":14}],9:[function(require,module,exports){
var assign = require('../util/assign')

function QUOT (args, ctx) {

}

assign(QUOT.prototype, {

    compile: function () {

    }

})

module.exports = QUOT

},{"../util/assign":14}],10:[function(require,module,exports){
var assign = require('../util/assign')

function ROOT (ctx, funcs) {
    this.ctx = ctx
    this.funcs = funcs
}

assign(ROOT.prototype, {

    compile: function () {
        /*
            TODO: finish string compilation
            honestly, shouldn't really need this.
            But nice extra feature.
        */

        // need to return the functions as a proper closure.
        return (
            ";(function(){" +
                "var ctx = " + JSON.stringify(this.ctx) +
            "});"
        )
    }

})

module.exports = ROOT
},{"../util/assign":14}],11:[function(require,module,exports){
var assign = require('../util/assign')

function SUM (args, ctx) {

}

assign(SUM.prototype, {

    compile: function () {

    }

})

module.exports = SUM

},{"../util/assign":14}],12:[function(require,module,exports){
module.exports = {
    'SUM': require('./SUM'),
    'DIFF': require('./DIFF'),
    'QUOT': require('./QUOT'),
    'PROD': require('./PROD'),
    'POW': require('./POW'),
    'ROOT': require('./ROOT')
}

},{"./DIFF":6,"./POW":7,"./PROD":8,"./QUOT":9,"./ROOT":10,"./SUM":11}],13:[function(require,module,exports){
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

},{"./configure/delimiters":5,"./util/getEscaped":15,"./util/pluck":20}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
function getEscaped (str) {
    /*
        basically any special character I want to escape, preceded by a \
        should escape [], (), {}, +, =, -, ^, $, &, |, and !
    */
    var escapes = /[\^\$\\\/\[\]\{\}\(\)\|\+\=\-\!]/g;

    return str.replace(escapes,"\\$&");
}

module.exports = getEscaped

},{}],16:[function(require,module,exports){
var keys = require('./keys')

function getIndexBy (collection, predicate) {
    var idx = -1,
        keyName = keys(predicate)[0],
        valName = predicate[keyName]

    collection.some(function (item, i) {
        if (item[keyName] === valName) {
            idx = i
            return true
        } else {
            return false
        }
    })


    return idx

}

module.exports = getIndexBy
},{"./keys":17}],17:[function(require,module,exports){
function keys (obj) {
    return Object.keys(obj)
}

module.exports = keys
},{}],18:[function(require,module,exports){
function last (collection) {
    return collection[collection.length - 1]
}

module.exports = last
},{}],19:[function(require,module,exports){
function omit (obj, keys) {

    var retVal = {}

    if (typeof keys === 'string') keys = [keys]

    Object.keys(obj).forEach(function (key) {

        if (keys.indexOf(key) === -1) {
            retVal[key] = obj[key]
        }

    })

    return retVal

}

module.exports = omit
},{}],20:[function(require,module,exports){
function pluck (collection, prop) {

    return collection.map(function (item) {
        return item[prop]
    })

}

module.exports = pluck

},{}]},{},[1])(1)
});