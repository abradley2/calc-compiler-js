var assign = require('../util/assign')

var SUM = require('./SUM')

function AVE (args, ctx) {
    var total = args.length,
        sum = SUM(args, ctx)

    return (sum / total)

}

assign(AVE.prototype, {

    compile: function () {

    }

})

module.exports = AVE