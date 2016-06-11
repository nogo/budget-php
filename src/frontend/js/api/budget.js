import m from 'mithril'
import moment from 'moment'

function create() {
    return {
        type: 'spend',
        date: moment().format('YYYY-MM-DD')
    }
}

function fetch() {
    return m.request({
        method: 'GET',
        url: 'api/budget'
    })
}

function persist() {
    return m.request({
        method: 'GET',
        url: 'api/budget'
    })
}


function remove() {
    return m.request({
        method: 'GET',
        url: 'api/budget'
    })
}


export default {
    create: create,
    fetch: fetch,
    persist: persist,
    remove: remove
}