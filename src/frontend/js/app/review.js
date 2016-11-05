import m from 'mithril'
import moment from 'moment'
import budget from '../api/budget.js'

function reviewCtrl (args) {
  this.budgetList = budget.fetch()
}

function calculateReview (budget) {
  let review = {}
  budget.forEach(item => {
    let year = moment(item.date).format('YYYY')
    let date = moment(item.date).format('YYYY-MM')

    if (!review[year]) {
      review[year] = {
        'income': 0,
        'spend': 0,
        'months': {}
      }
    }

    if (!review[year]['months'][date]) {
      review[year]['months'][date] = {
        'income': 0,
        'spend': 0
      }
    }
    switch (item.type) {
      case 'income':
        review[year].income += item.amount
        review[year]['months'][date].income += item.amount
        break
      default:
        review[year].spend += item.amount
        review[year]['months'][date].spend += item.amount
    }
  })
  return review
}

function reviewItemView (title, income, outcome) {
  income = income || 0
  outcome = outcome || 0

  let sum = income - outcome
  let itemClass = ''

  if (sum > 0) {
    itemClass = '.green-text'
  } else if (sum < 0) {
    itemClass = '.red-text'
  }

  return m('tr', [
    m('td', title),
    m('td', income.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })),
    m('td', outcome.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })),
    m('td' + itemClass, sum.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }))
  ])
}

function reviewTableView (title, year) {
  let months = year['months']
  return m('div', [
    m('h4.center-align', title),
    m('table.striped', [
      m('thead', [
        m('tr', [
          m('th', 'Datum'),
          m('th', 'Einnahme'),
          m('th', 'Ausgabe'),
          m('th', 'Summe')
        ])
      ]),
      m('tbody', Object.keys(months).map(key => reviewItemView(key, months[key].income, months[key].spend))),
      m('tfoot', reviewItemView('Gesamt', year.income, year.spend))
    ])
  ])
}

function reviewView (ctrl) {
  let review = calculateReview(ctrl.budgetList())

  return m('div.container',
    Object
      .keys(review)
      .sort(function (a, b) {
        return b.localeCompare(a)
      })
      .map(key => reviewTableView(key, review[key]))
  )
}

export default {
  controller: reviewCtrl,
  view: reviewView
}
