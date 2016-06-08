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

        console.log('nodes = ',nodes)

        // simple cleanup of the nodes
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

                // if the node is a variable or constant
                // put it on the operator stack
                if (node.type !== 'FUNC') {

                    operands.push(node)
                }
                // if the node is a function
                // execute the function, then store
                // its result as a const on the
                // operand stack
                if (node.type === 'FUNC') {
                    // use the arity of the function to
                    // determine how many operands must
                    // be retrieved from the stack to use
                    // as arguments

                    // use the function name to figure
                    // out which function in funcLib
                    // to apply
                    var start = operands.length - node.arity,
                        count = node.arity,
                        args = operands.splice(start, count),
                        func = funcLib[node.name]

                    var result = func(args, ctx)

                    // then push the result on the operand stack
                    operands.push({
                        type: 'CONST',
                        value: result
                    })

                }
            })
            // the last remaining CONST is the returned value
            return last(operands).value
        }

    },

    compile: function (_stack) {

        return ('function (row) {' +
            this.importClosure() +

        '}')

    }

})

module.exports = Compiler
