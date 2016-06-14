import m from 'mithril'
import moment from 'moment'

let url = 'api/budget'

function create () {
  return {
    type: 'spend',
    date: moment().format('YYYY-MM-DD')
  }
}

function fetch () {
  return m.request({
    method: 'GET',
    url: url,
    initialValue: []
  }).then((list) => list.sort((a, b) => {
    let result = 0
    if (moment(a.date).isAfter(b.date)) {
      result = -1
    } else if (moment(a.date).isBefore(b.date)) {
      result = 1
    }
    return result
  }))
}

function persist (item) {
  if (!item || !item.amount) {
    return false
  }

  let method = 'POST'
  if (item.id) {
    method = 'PUT'
    url = url + '/' + item.id
  }

  return m.request({
    method: method,
    url: url,
    data: item
  })
}

function remove (item) {
  if (!item || !item.id) {
    return
  }

  return m.request({
    method: 'DELETE',
    url: url + '/' + item.id
  })
}

export default {
  create: create,
  fetch: fetch,
  persist: persist,
  remove: remove
}
