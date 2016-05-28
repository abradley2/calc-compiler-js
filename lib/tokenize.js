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
    }

    console.log('stack = ',stack)

    return stack
}

module.exports = tokenize
