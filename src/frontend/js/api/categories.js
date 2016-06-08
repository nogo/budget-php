import m from 'mithril'

function fetchAll () {
  return m.request({
    method: 'GET',
    url: 'api/categories'
  })
}

export default {
    fetch: fetchAll
}
