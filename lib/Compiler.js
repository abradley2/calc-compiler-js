var grammar = require('./grammar'),
    Tokenizer = require('./Tokenizer'),
    Tree = require('./Tree'),
    func = require('./func'),
    assign = require('./util/assign'),
    omit = require('./util/omit'),
    getIndexBy = require('./util/getIndexBy'),
    last = require('./util/last')


function cleanStackNode (node) {
    return omit(node, 'funcDepth')
}

function Compiler () {

    this.tokenizer = new Tokenizer( grammar )

}

assign(Compiler.prototype, {

    getStack: function (template) {

        var tokens = this.tokenizer.getTokens(template),
            tree = new Tree(tokens),
            nodes = tree.parse()

        /*
            now use the functions in /func
            to sub in for function nodes and
            create a working expression
        */

        var operands = [],
            stack = []

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
                    args = operands.splice( getIndexBy(operands, {funcDepth: node.funcDepth}) )

                    stack.push({
                        type: 'FUNC',
                        content: node.content,
                        args: args.map(cleanStackNode)
                    })
                    break
                case 'OPERATOR':
                    args = operands.splice(0)

                    stack.push({
                        type: 'OPERATOR',
                        content: node.content,
                        args: args.map(cleanStackNode)

                    })
                    break
                default:
                    break
            }
        }

        return stack

    },

    getFunc: function (stack) {

    },

    compile: function () {
        /* 
            Going to omit the actual compilation to a string. 
            This is best used to create and use functions in 
            memory. 

            Eval is evil.
        */
    }

})

module.exports = Compiler
