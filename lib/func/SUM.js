var assign = require('../util/assign')

function SUM (args, ctx) {
    var retVal = 0

    args.forEach(function (arg) {

        if (arg.type === 'VAR') {
            retVal += ctx[arg.name]
        } else {
            retVal += arg.value
        }

    })

    return retVal
}

assign(SUM.prototype, {

    compile: function () {
        return this.toString()
    }

})

module.exports = SUM
