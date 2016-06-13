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
  })
}

function persist () {
  return m.request({
    method: 'GET',
    url: url
  })
}

function remove () {
  return m.request({
    method: 'GET',
    url: url
  })
}

export default {
  create: create,
  fetch: fetch,
  persist: persist,
  remove: remove
}
