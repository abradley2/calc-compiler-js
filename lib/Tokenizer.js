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

            /*
                Once there's at least 2 elements on the stack, give each stack
                element a reference to the previous one for convenience
            */
            if (stack.length >= 2) {
                // for now, I don't think I need this
                //stack[stack.length - 1].previous = stack[stack.length - 2]

            }

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
