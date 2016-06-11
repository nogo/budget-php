import m from 'mithril'
import moment from 'moment'
import viewBudgetListItem from './item.js'

let header

function listCtrl (args) {
  let date = m.prop(args.currentDate || moment().format('YYYY-MM'))
  let budgetList = args.budget()
  let result = []

  let filteredList = budgetList.filter(item => date() === moment(item.date).format('YYYY-MM'))
  if (!filteredList || filteredList.length <= 0) {
    result.push(viewBudgetListItem('Keine Einträge gefunden.'))
  }  else {
    result = filteredList.map(item => {
      let title = 'Nicht definiert'
      var c = args.categories().find(c => c.id === item.category_id)
      if (c) {
          title = c.name
      }
      return viewBudgetListItem(title, item, date())
    })

    let total = filteredList
      .map(item => (item.type === 'spend' ? -1 : 1) * parseFloat(item.amount))
      .reduce((prev, curr) => (prev || 0) + curr);
    if (total > 0) {
      result.unshift(viewBudgetListItem('Gesamt', {
          amount: total
      }))
    }
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
