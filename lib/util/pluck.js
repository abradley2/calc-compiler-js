function pluck (collection, prop) {

    return collection.map(function (item) {
        return item[prop]
    })

}

module.exports = pluck
