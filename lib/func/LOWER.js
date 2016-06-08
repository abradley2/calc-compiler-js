var assign = require('../util/assign')

function LOWER (args, ctx) {
    if (args[0].type === 'VAR') {
        return ctx[args[0].name].toLowerCase()
    } else {
        return args[0].value.toLowerCase()
    }
}

assign(LOWER.prototype, {

    compile: function () {

    }

})

module.exports = LOWER