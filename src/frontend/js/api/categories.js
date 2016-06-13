import m from 'mithril'

function fetch () {
  return m.request({
    method: 'GET',
    url: 'api/categories',
    initialValue: []
  })
}

export default {
    fetch: fetch
}
