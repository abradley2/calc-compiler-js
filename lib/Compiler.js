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
            stack = tree.parse()

        /*
            Simple cleanup to get everything in order
        */
        stack.map(function (node) {
            switch (node.type) {
                case 'FUNC':
                    node = {
                        type: 'FUNC',
                        name: node.content,
                        arity: node.arity
                    }
                    break
                case 'OPERATOR':
                    node = {
                        type: 'FUNC',
                        name: funcMap[node.content],
                        arity: 2
                    }
                case 'VAR':
                    node = {
                        type: 'VAR',
                        value: node.value
                    }
                case 'CONST': 
                    node = {
                        type: 'CONST',
                        value: node.value
                    }
                default:
                    break
            }
            return node
        })
        console.log('STACK = ',stack)
        return stack

    },

    generate: function (_stack) {

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
                    
                    var start = (idx - 1) - node.arity,
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
            return last(operands)
        }

    }

})

module.exports = Compiler
