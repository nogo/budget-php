import m from 'mithril'

export default function budgetItemView (title, item, currentDate) {
  title = title || 'Unbekannt'

  let result = [m('span.title', title)]
  let attr = {}
  let itemClass = ''

  if (item) {
    if (item.id && currentDate) {
      attr.href = '/' + currentDate + '/' + item.id
      attr.config = m.route
    }

    switch (item.type) {
      case 'income':
        itemClass = '.green-text'
        break
      case 'spend':
        itemClass = '.red-text'
        break
      default:
        itemClass = '.black-text'
    }

    if (item.description) {
      result.push(m('span.description', item.description))
    }

    if (item.amount) {
      result.push(m('span.secondary-content.amount' + itemClass, item.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })))
    }
  }

  return m('a.collection-item.list-item' + itemClass, attr, result)
}
