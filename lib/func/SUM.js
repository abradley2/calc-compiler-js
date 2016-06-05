var assign = require('../util/assign')

function SUM (args, ctx) {
    var retVal = 0

    args.forEach(function (arg) {

        if (arg.type === 'VAR') {
            retVal += parseInt(ctx[arg.content])
        } else {
            retVal += parseInt(arg.content)
        }

    })

    return retVal
}

assign(SUM.prototype, {

    compile: function () {

    }

})

module.exports = SUM
