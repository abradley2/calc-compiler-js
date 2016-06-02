var assign = require('../util/assign')

function ROOT (ctx, funcs) {
    this.ctx = ctx
    this.funcs = funcs
}

assign(ROOT.prototype, {

    compile: function () {
        /*
            TODO: finish string compilation
            honestly, shouldn't really need this.
            But nice extra feature.
        */

        // need to return the functions as a proper closure.
        return (
            ";(function(){" +
                "var ctx = " + JSON.stringify(this.ctx) +
            "});"
        )
    }

})

module.exports = ROOT