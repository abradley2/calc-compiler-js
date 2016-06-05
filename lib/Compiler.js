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
