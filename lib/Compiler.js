var grammar = require('./grammar'),
    Tokenizer = require('./Tokenizer'),
    Tree = require('./Tree'),
    func = require('./func'),
    assign = require('./util/assign'),
    last = require('./util/last')

var timer = function(name) {
    var start = new Date();
    return {
        start: function() {
            start = new Date();
        },

        stop: function() {
            var end  = new Date();
            var time = end.getTime() - start.getTime();
            console.log('Timer:', name, 'finished in', time, 'ms');
        }
    }
};


function Compiler () {

    this.tokenizer = new Tokenizer( grammar )

}

assign(Compiler.prototype, {

    compileTemplate: function (template) {

        

        

        var tokens = this.tokenizer.getTokens(template)

        var tree = new Tree(tokens)





        var nodes = tree.parse()

        var t = new timer()


        /*
            now use the functions in /func
            to sub in for function nodes and
            create a working expression
        */

        var operands = [],
            stack = []

        console.log(JSON.stringify(nodes))

        while (nodes.length > 0) {
            
            var node = nodes.shift()

            switch (node.type) {
                case 'CONST':
                    operands.push({
                        type: 'CONST',

                    })
                    break
                case 'FUNC':
                    stack.push({
                        'FUNC': [],
                        'ARGUMENTS': []
                    })
                    while ( last(operands) && last(stack).funcDepth === last(operands).funcDepth ) {
                        last(stack).ARGUMENTS.push( operands.pop() )
                    }
                case 'operator':
                    stack.push({
                        'OPERATOR': node.content,
                        'OPERANDS': []
                    })
                    break
                default:
                    break
            }
        }

        t.stop()

        /*
            Finally, return the output function
        */
        return function (row) {
            return row
        }

    },

    stackToFunction: function (stack) {

    }

})

module.exports = Compiler
