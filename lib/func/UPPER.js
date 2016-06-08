var assign = require('../util/assign')

function UPPER (args, ctx) {
    if (args[0].type === 'VAR') {
        return ctx[args[0].name].toUpperCase()
    } else {
        return args[0].value.toUpperCase()
    }
}

assign(UPPER.prototype, {

    compile: function () {

    }

})

module.exports = UPPER