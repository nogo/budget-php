import m from 'mithril'
import moment from 'moment'
import viewBudgetListItem from './item.js'

function listCtrl (args) {
  let date = m.prop(args.currentDate || moment().format('YYYY-MM'))
  let budgetList = args.budget()
  let result = []
  let header

  let filteredList = budgetList.filter(item => date() === moment(item.date).format('YYYY-MM'))
  if (!filteredList || filteredList.length <= 0) {
    result.push(viewBudgetListItem('Keine Einträge gefunden.'))
  } else {
    let total = filteredList
      .map(item => (item.type === 'spend' ? -1 : 1) * parseFloat(item.amount))
      .reduce((prev, curr) => (prev || 0) + curr)
    result.push(viewBudgetListItem('Gesamt', { amount: total }))

    filteredList.forEach(item => {
      let title = 'Nicht definiert'
      var c = args.categories().find(c => c.id === item.category_id)
      if (c) {
        title = c.name
      }

      if (!header || header !== item.date) {
        header = item.date
        result.push(m('div.collection-header', moment(header).format('DD.MM.YYYY')))
      }

      result.push(viewBudgetListItem(title, item, date()))
    })
  }

  this.date = date
  this.results = m.prop(result)
}

function listView (ctrl) {
  return m('div.collection.with-header', [
    m('div.collection-header.center-align', ctrl.date()),
    ctrl.results()
  ])
}

export default {
  controller: listCtrl,
  view: listView
}
