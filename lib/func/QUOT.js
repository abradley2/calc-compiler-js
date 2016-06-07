var assign = require('../util/assign')

function QUOT (args, ctx) {
    var retVal

    args.forEach(function (arg) {
        var mod

        if (arg.type === 'VAR') {
            mod = parseFloat(ctx[arg.name])
        } else {
            mod = parseFloat(arg.value)
        }

        if (retVal) { retVal = retVal / mod } else { retVal = mod }
    })

    return retVal
}

assign(QUOT.prototype, {

    compile: function () {

    }

})

module.exports = QUOT
