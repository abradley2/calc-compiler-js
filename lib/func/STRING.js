var assign = require('../util/assign')

function STRING (args, ctx) {
    if (args[0].type === 'VAR') {
        return (ctx[args[0].name]).toString()
    } else {
        return (ctx[args[0]].value).toString()
    }
}

assign(STRING.prototype, {

    compile: function () {

    }

})

module.exports = STRING