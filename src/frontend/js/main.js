import m from 'mithril'
import moment from 'moment'
import categories from './api/categories.js'
import budget from './api/budget.js'
import formComponent from './app/form.js'
import budgetComponent from './app/list.js'
import navigationComponent from './app/navigation.js'

function selectCurrentItem (id, budgetList) {
  if (!id || !budgetList) {
    return budget.create()
  }

  return budgetList().find(item => id === item.id)
}

const mainComponent = {
  controller: function () {
    this.categoryList = categories.fetch()
    this.budgetList = budget.fetch()

    const parameter = m.route.param('param')
    const match = (parameter) ? parameter.match(/(\d{4}\-\d{2})?\/?(\d+)?/) : []
    this.currentDate = match[1] ? match[1] : moment().format('YYYY-MM')
    this.currentItem = match[2] ? match[2] : 0

    // TODO redirect if parameter not correct
  },
  view: function (ctrl) {
    return m('div.row', [
      m('div.col.s12.m5.l4',
        m.component(formComponent, {
          item: selectCurrentItem(ctrl.currentItem, ctrl.budgetList),
          budget: ctrl.budgetList,
          categories: ctrl.categoryList
        })
      ),
      m('div.col.s12.m7.l8', [
        m.component(budgetComponent, {
          budget: ctrl.budgetList,
          categories: ctrl.categoryList,
          currentDate: ctrl.currentDate
        }),
        m.component(navigationComponent, {
          currentDate: ctrl.currentDate
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
