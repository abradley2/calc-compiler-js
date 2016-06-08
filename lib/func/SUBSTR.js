var assign = require('../util/assign')

function SUBSTR (args, ctx) {

    var str = args[0].value ? args[0].value : ctx[args[0].name],
        start = args[1].value ? args[1].value : ctx[args[1].name],
        stop = args[2].value ? args[2].value : ctx[args[2].name]

    return str.substring(start, stop || str.length)
}

assign(SUBSTR.prototype, {

    compile: function () {

    }

})

module.exports = SUBSTR