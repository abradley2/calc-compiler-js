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

function cleanStackNode (node) {
    return omit(node, 'funcDepth')
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
                    console.log('operands = ',operands)

                    var start = (operands.length - 1) - node.arity,
                        count = node.arity,
                        args = operands.splice(start, count),
                        func = funcLib[node.name]

                    console.log('start args = ',start)

                    var result = func(args, ctx)

                    operands.push({
                        type: 'CONST',
                        value: result
                    })

                }
            })
            // the last remaining CONST is the returned value
            return last(operands)
        }

    }

})

module.exports = Compiler
