function yieldNextToken (tpl, grammar, stack) {

    grammar.some(function (grammarObj) {

        var match = grammarObj.test.exec(tpl)

        if (match) {
            tpl = tpl.replace(grammarObj.test, '')
            stack.push({
                name: grammarObj.name,
                found: match[0]
            })
            return true
        }

    })

    return tpl

}

function tokenize (tpl, grammar) {
    var template = tpl,
        stack = []

    while (template.length > 0){
        template = yieldNextToken(template, grammar, stack)

        /*
            Once there's at least 2 elements on the stack, give each stack
            element a reference to the previous one for convenience
        */
        if (stack.length >= 2) {

            stack[stack.length - 1].previous = stack[stack.length - 2]

        }

    }

    return stack
}

module.exports = tokenize
