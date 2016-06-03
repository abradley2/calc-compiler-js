var keys = require('./keys')

function getIndexBy (collection, predicate) {
    var idx = -1,
        keyName = keys(predicate)[0],
        valName = predicate[keyName]

    collection.some(function (item, i) {
        if (item[keyName] === valName) {
            idx = i
            return true
        } else {
            return false
        }
    })


    return idx

}

module.exports = getIndexBy