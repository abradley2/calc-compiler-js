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
                    return {
                        type: 'FUNC',
                        name: node.content,
                        arity: node.arity
                    }
                case 'OPERATOR':
                    return {
                        type: 'FUNC',
                        name: funcMap[node.content],
                        arity: 2
                    }
                default:
                    return {
                        type: 'OPERAND',
                        value: node.value
                    }
            }
        })

        return stack

    },

    generate: function (stack) {

        console.log('generate from stack', stack)

        return function (ctx) {

        }

    }

})

module.exports = Compiler
