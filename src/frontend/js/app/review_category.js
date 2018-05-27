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
    let month = item.month;
    let category = categories.find(c => c.id === item.category_id)

    if (category) {
      category = category.name
    } else {
      category = 'Nicht definiert'
    }

    if (!review[month]) {
      review[month] = {
        'income': 0,
        'spend': 0,
        'categories': {}
      }
    }

    review[month]['categories'][category] = {
      'income': item.income,
      'spend': item.spend
    }

    // total
    review[month].income += item.income
    review[month].spend += item.spend
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

function reviewTableView (title, month) {
  let categories = month['categories']
  return m('div', [
    m('h4.center-align', title),
    m('table.striped', [
      m('thead', [
        m('tr', [
          m('th', 'Kategorie'),
          m('th', 'Einnahme'),
          m('th', 'Ausgabe'),
          m('th', 'Summe')
        ])
      ]),
      m('tbody', Object.keys(categories).map(key =>
        reviewItemView(
          key,
          categories[key].income,
          categories[key].spend
        )
      )),
      m('tfoot', reviewItemView('Gesamt', month.income, month.spend))
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
