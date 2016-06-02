var keys = require('keys')

function getIndexBy (collection, predicate) {
    var idx = -1

    collection.some(function (val, i) {
        var val1 = collection[ keys(collection)[0] ],
            val2 = predicate[ keys(predicate)[0] ]

        if (val1 === val2) {
            idx = i
            return true
        } else {
            return false
        }
    })

    return idx

}

module.exports = getIndexBy