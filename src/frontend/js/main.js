import m from 'mithril'
import moment from 'moment'
import categories from './api/categories.js'
import budget from './api/budget.js'
import formComponent from './app/form.js'
import budgetComponent from './app/list.js'
import navigationComponent from './app/navigation.js'

function matchDateParam (parameter) {
  if (!parameter) {
    return moment().format('YYYY-MM')
  }

  return parameter
}

function matchIdParam(parameter, budgets) {
  if (!parameter || !budget) {
    return
  }

  let item = budgets.find(item => parameter == item.id)
  if (!item || !item.amount) {
    return budget.create()
  }

  return item
}

let mainComponent = {
    controller: function() {

      this.categories = m.prop([{id: 1, name: 'Bäcker'}]) //categories.fetch()
      this.budget = m.prop([{id: 1, amount: 10, category_id: 1}])//budget.fetch()

      let parameter = m.route.param('param')
      let match = (parameter) ? parameter.match(/(\d{4}\-\d{2})?\/?(\d+)?/) : []

      this.currentDate = matchDateParam(match[1])
      this.item = matchIdParam(match[2], this.budget())

      // TODO redirect if parameter not correct
    },
    view: function(ctrl) {
        let date = moment(ctrl.currentDate, 'YYYY-MM').startOf('month')
        let last = date.clone().subtract(1, 'month').format('YYYY-MM')
        let next = date.clone().add(1, 'month').format('YYYY-MM')

        return m('div.row', [
            m('div.col.s12.m5.l4',
              m.component(formComponent, {
                item: ctrl.item,
                budget: ctrl.budget,
                categories: ctrl.categories,
              })
            ),
            m('div.col.s12.m7.l8', [
              m.component(budgetComponent, {
                budget: ctrl.budget,
                categories: ctrl.categories,
                currentDate: ctrl.currentDate
              }),
              m.component(navigationComponent, {
                last: last,
                next: next
              })
            ])
        ])
    }
}

m.route.mode = "hash"
m.route(document.getElementById('app'), '/', {
    '/': mainComponent,
    '/:param...': mainComponent
})
