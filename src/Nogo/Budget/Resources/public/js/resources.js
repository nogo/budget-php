'use strict';

/**
 * Resources.js
 *
 * TODO Offline support
 * TODO localStorage einbauen
 *
 * @param {object} options Resource configuration
 * @returns {Resource}
 */
var Resource = function (options) {
    var that = this;

    this.config = _.extend({
        idAttribute: 'id',
        sorted: false,
        empty: {}
    }, options);
    this.collection = [];
    this.map = {};

    m.request({ method: 'GET', url: this.config.url })
    .then(function (list) {
        that.collection = _.isFunction(that.config.sort) ? list.sort(that.config.sort) : list;
        that.map = that.buildIdxMap(that.collection, that.config.idAttribute);
        return that.collection;
    });
};

Resource.prototype.buildIdxMap = function (collection, attr) {
    collection = collection || [];
    attr = attr || 'id';
    var map = {};
    for (var i = 0; i < collection.length; i++) {
        map[collection[i][attr]] = i;
    }
    return map;
};

Resource.prototype.empty = function (data) {
    data = data || {};
    return _.extend({}, this.config.empty, data);
};

Resource.prototype.first = function () {
    return (this.collection.length > 0) ? this.collection[0] : undefined;
};

Resource.prototype.last = function () {
    return (this.collection.length > 0) ? this.collection[this.collection.length - 1] : undefined;
};

Resource.prototype.find = function (id) {
    var cached = this.collection[this.map[id]];

    if (!cached) {
        cached = this.empty();
    }
    return cached;
};

Resource.prototype.findAll = function () {
    return this.collection;
};

Resource.prototype.persist = function (data) {
    var url = this.config.url,
        method = 'POST',
        that = this,
        deferred = m.deferred();

    if (data[this.config.idAttribute]) {
        url = this.config.url + '/' + data[this.config.idAttribute];
        method = 'PUT';
    }

    m.request({ method: method, url: url, data: data })
    .then(function(response) {
        if (method === 'POST') {
            that.collection.push(response);
            if (_.isFunction(that.config.sort)) {
                that.collection = that.collection.sort(that.config.sort);
            }
        }
        deferred.resolve(response);
        return response;
    });
    deferred.promise(data);
    return deferred.promise;
};

Resource.prototype.remove = function (data) {
    var url = this.config.url,
        method = 'DELETE',
        that = this,
        deferred = m.deferred(),
        id = data[this.config.idAttribute];

    if (id) {
        url = this.config.url + '/' + id;

        m.request({ method: method, url: url })
        .then(function(response) {
            var idx = that.map[id],
                item = data;
            if (idx !== undefined) {
                item = that.collection.splice(idx, 1);
                that.map = that.buildIdxMap(that.collection, that.config.idAttribute);
            }
            deferred.resolve(item);
            return item;

        });
        deferred.promise({});
    } else {
        deferred.reject();
    }
    return deferred.promise;
};