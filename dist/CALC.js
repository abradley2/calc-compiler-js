(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.CALC = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Compiler = require('./lib/Compiler'),
    c = new Compiler()

//var testTemplate = 'SUM(1 - 8, DIFF(3, 1, 20), 4 * price)'
var testTemplate = 'SUM(A, 2 * B)'

var data = [
    {A: 2, B: 3},
    {A: 7, B: 8},
    {A: 1, B: 1},
    {A: 43, B: 19}
]

var outStack = c.parse( testTemplate )

var outFunc = c.generate( outStack )

var result = outFunc( data[0] )

console.log('result = ', result)

module.exports = Compiler

},{"./lib/Compiler":2}],2:[function(require,module,exports){
var grammar = require('./grammar'),
    Tokenizer = require('./Tokenizer'),
    Tree = require('./Tree'),
    funcLib = require('./func'),
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

function Compiler () {

    this.tokenizer = new Tokenizer( grammar )

}

assign(Compiler.prototype, {

    parse: function (template) {

        var tokens = this.tokenizer.getTokens(template),
            tree = new Tree(tokens),
            nodes = tree.parse()

        /*
            Simple cleanup to get everything in order
        */
        var stack = nodes.map(function (node) {
            if (node.type === 'OPERATOR') {
                node = {
                    type: 'FUNC',
                    name: funcMap[node.content],
                    arity: 2
                }
            }
            return node
        })

        return stack

    },

    generate: function (_stack) {
        // here to remind me to add a 'create closure' function
        // for to-string compiling
        var stack = _stack

        return function (ctx) {
            var operands = []

            stack.forEach(function (node, idx) {

                if (node.type === 'VAR' || node.type === 'CONST') {
                    operands.push(node)
                }
                if (node.type === 'FUNC') {
                    // execute the function, then store
                    // its result as a const on the
                    // operand stack

                    var start = operands.length - node.arity,
                        count = node.arity,
                        args = operands.splice(start, count),
                        func = funcLib[node.name]

                    var result = func(args, ctx)

                    operands.push({
                        type: 'CONST',
                        value: result
                    })

                }
            })
            // the last remaining CONST is the returned value
            return last(operands).value
        }

    }

})

module.exports = Compiler

},{"./Tokenizer":3,"./Tree":4,"./func":11,"./grammar":12,"./util/assign":13,"./util/getIndexBy":15,"./util/last":17,"./util/omit":18}],3:[function(require,module,exports){
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

},{"./util/assign":13}],4:[function(require,module,exports){
var assign = require('./util/assign'),
    last = require('./util/last')

function Tree (tokens) {
    this.tokens = tokens
}

assign(Tree.prototype, {

    parse: function () {

        // create a clone of the tokens array so it is not mutated
        var tokens = this.tokens.slice()

        // remove whitespace tokens. They aren't relevant
        this.removeWhitespaceTokens(tokens)

        return this.getExpressionNode(tokens)
    },

    // function for removing all whitespace tokens
    removeWhitespaceTokens: function (tokens) {
        tokens = tokens.filter(function (token) {
            return token.name !== 'WHITESPACE'
        })
        return tokens
    },

    getConst: function (token) {
        if (token.found.match(/^[a-zA-Z]/)) {
            return {
                type: 'VAR',
                name: token.found
            }
        } else {
            return {
                type: 'CONST',
                value: token.found
            }
        }
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
                            name: token.found
                        })
                    } else {
                        output.push(this.getConst(token))
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

                    
                    // while there is an operator token o2, at the top of the operator stack and either
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

},{"./util/assign":13,"./util/last":17}],5:[function(require,module,exports){
var delimiters = {
    BEG_ARGS: '(',
    END_ARGS: ')',
    ARG_SEP: ','
}

module.exports = delimiters

},{}],6:[function(require,module,exports){
var assign = require('../util/assign')

function DIFF (args, ctx) {
    var retVal

    args.forEach(function (arg) {
        var mod

        if (arg.type === 'VAR') {
            mod = parseFloat(ctx[arg.name])
        } else {
            mod = parseFloat(arg.value)
        }

        if (retVal) { retVal -= mod } else { retVal = mod }

    })

    return retVal
}

assign(DIFF.prototype, {

    compile: function () {

    }

})

module.exports = DIFF

},{"../util/assign":13}],7:[function(require,module,exports){
var assign = require('../util/assign')

function POW (args, ctx) {

}

assign(POW.prototype, {

    compile: function () {

    }

})

module.exports = POW

},{"../util/assign":13}],8:[function(require,module,exports){
var assign = require('../util/assign')

function PROD (args, ctx) {
    var retVal = 1

    args.forEach(function (arg) {
        if (arg.type === 'VAR') {
            retVal = retVal * parseFloat(ctx[arg.name])
        } else {
            retVal = retVal * parseFloat(arg.value)
        }
    })

    return retVal
}

assign(PROD.prototype, {

    compile: function () {

    }

})

module.exports = PROD

},{"../util/assign":13}],9:[function(require,module,exports){
var assign = require('../util/assign')

function QUOT (args, ctx) {

}

assign(QUOT.prototype, {

    compile: function () {

    }

})

module.exports = QUOT

},{"../util/assign":13}],10:[function(require,module,exports){
var assign = require('../util/assign')

function SUM (args, ctx) {
    var retVal = 0

    args.forEach(function (arg) {

        if (arg.type === 'VAR') {
            retVal += parseFloat(ctx[arg.name])
        } else {
            retVal += parseFloat(arg.value)
        }

    })

    return retVal
}

assign(SUM.prototype, {

    compile: function () {

    }

})

module.exports = SUM

},{"../util/assign":13}],11:[function(require,module,exports){
module.exports = {
    'SUM': require('./SUM'),
    'DIFF': require('./DIFF'),
    'QUOT': require('./QUOT'),
    'PROD': require('./PROD'),
    'POW': require('./POW')
}

},{"./DIFF":6,"./POW":7,"./PROD":8,"./QUOT":9,"./SUM":10}],12:[function(require,module,exports){
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

},{"./configure/delimiters":5,"./util/getEscaped":14,"./util/pluck":19}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
function getEscaped (str) {
    /*
        basically any special character I want to escape, preceded by a \
        should escape [], (), {}, +, =, -, ^, $, &, |, and !
    */
    var escapes = /[\^\$\\\/\[\]\{\}\(\)\|\+\=\-\!]/g;

    return str.replace(escapes,"\\$&");
}

module.exports = getEscaped

},{}],15:[function(require,module,exports){
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
},{"./keys":16}],16:[function(require,module,exports){
function keys (obj) {
    return Object.keys(obj)
}

module.exports = keys
},{}],17:[function(require,module,exports){
function last (collection) {
    return collection[collection.length - 1]
}

module.exports = last
},{}],18:[function(require,module,exports){
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
},{}],19:[function(require,module,exports){
function pluck (collection, prop) {

    return collection.map(function (item) {
        return item[prop]
    })

}

module.exports = pluck

},{}]},{},[1])(1)
});