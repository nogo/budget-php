import m from 'mithril'
import moment from 'moment'
import categories from './api/categories.js'
import budget from './api/budget.js'
import formComponent from './app/form.js'
import budgetComponent from './app/list.js'
import navigationComponent from './app/navigation.js'

let currentDate = moment().format('YYYY-MM')
let currentId = 0

function selectCurrentItem (id, budgetList) {
  if (!id || !budgetList) {
    return budget.create()
  }

  return budgetList().find(item => id === item.id)
}

function checkRoute () {
  const parameter = m.route.param('param')
  const match = (parameter) ? parameter.match(/(\d{4}\-\d{2})?\/?(\d+)?/) : []
  currentDate = match[1] ? match[1] : moment().format('YYYY-MM')
  currentId = match[2] ? match[2] : 0
}

const mainComponent = {
  controller: function () {
    this.categoryList = categories.fetch()
    this.budgetList = budget.fetch()
  },
  view: function (ctrl) {
    checkRoute()
    return m('div.row', [
      m('div.col.s12.m5.l4',
        m.component(formComponent, {
          item: selectCurrentItem(currentId, ctrl.budgetList),
          budget: ctrl.budgetList,
          categories: ctrl.categoryList
        })
      ),
      m('div.col.s12.m7.l8', [
        m.component(budgetComponent, {
          budget: ctrl.budgetList,
          categories: ctrl.categoryList,
          currentDate: currentDate
        }),
        m.component(navigationComponent, {
          currentDate: currentDate
        })
      ])
    ])
  }
}

m.route.mode = 'hash'
m.route(document.getElementById('app'), '/', {
  '/': mainComponent,
  '/:param...': mainComponent
})
