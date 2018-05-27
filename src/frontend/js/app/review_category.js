import m from 'mithril'
import moment from 'moment'
import categories from '../api/categories.js'
import review from '../api/review_category_monthly.js'

function reviewCtrl (args) {
  this.categoryList = categories.fetch()
  this.budgetList = review.fetch()
}

function calculateReview (budget, categories) {
  let review = {}
  budget.forEach(item => {
    let year = item.month.substring(0,4);
    let date = item.month + '_' + item.category_id;
    let category = categories.find(c => c.id === item.category_id)

    if (!review[year]) {
      review[year] = {
        'income': 0,
        'spend': 0,
        'months': {}
      }
    }

    review[year]['months'][date] = {
      'category': category,
      'income': item.income,
      'spend': item.spend
    }

    // total
    review[year].income += item.income
    review[year].spend += item.spend
  })
  return review
}

function reviewItemView (title, income, outcome, category) {
  income = income || 0
  outcome = outcome || 0
  category = category || ''

  let sum = income - outcome
  let itemClass = ''

  if (sum > 0) {
    itemClass = '.green-text'
  } else if (sum < 0) {
    itemClass = '.red-text'
  }

  return m('tr', [
    m('td', title),
    m('td', category),
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
          m('th', 'Kategory'),
          m('th', 'Einnahme'),
          m('th', 'Ausgabe'),
          m('th', 'Summe')
        ])
      ]),
      m('tbody', Object.keys(months).map(key =>
        reviewItemView(
          key.substring(0,7),
          months[key].income,
          key.substring(0,7),
          months[key].spend
        )
      )),
      m('tfoot', reviewItemView('Gesamt', year.income, year.spend))
    ])
  ])
}

function reviewView (ctrl) {
  let review = calculateReview(ctrl.budgetList(), ctrl.categoryList())

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
