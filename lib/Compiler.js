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
            nodes = tree.parse()

        var operands = [],
            stack = []

        console.log('nodes = ',nodes)

        while (nodes.length > 0) {
            
            var node = nodes.shift(),
                args = []

            switch (node.type) {
                case 'CONST':
                    operands.push({
                        type: 'CONST',
                        content: node.content
                    })
                    break
                case 'FUNC':
                    stack.push({
                        type: 'FUNC',
                        name: node.content,
                        arity: node.arity
                    })
                    break
                case 'OPERATOR':
                    /*
                        Convert operators to appropriate functions
                    */
                    stack.push({
                        type: 'FUNC',
                        name: funcMap[node.content],
                        arity: 2
                    })
                    break
                default:
                    break
            }
        }

        console.log('STACK = ',stack)

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
