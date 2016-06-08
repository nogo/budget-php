import m from 'mithril'
import moment from 'moment'
import categories from './api/categories.js'
import budget from './api/budget.js'
import form from './app/form.js'
import viewBudgetList from './app/list.js'

m.route.mode = "hash"
m.route(document.getElementById('app'), '/', {
    '/': {
        controller: function() {
            let scope = {}

            scope.categories = categories.fetch()
            scope.budget = budget.fetch()
            scope.currentDate = moment().format('YYYY-MM')
            scope.item = budget.create()

            var param = m.route.param('param')
            if (param) {
                var match = param.match(/(\d{4}\-\d{2})?\/?(\d+)?/)

                if (match[1] !== undefined) {
                    scope.currentDate = match[1]
                }

                if (match[2] !== undefined) {
                    scope.item = scope.budget.find(match[2])
                    if (scope.item && !scope.item.amount) {
                        if (match[1] !== undefined) {
                            m.route('/' + match[1])
                        } else {
                            m.route('/')
                        }
                    }
                }
            }

            scope.add = function(e) {
                e.preventDefault()
                if (!scope.item.amount) {
                    return
                }
                budget.persist(scope.item).then(function(data) {
                    scope.item = budget.create()
                    if (match && match[1] !== undefined) {
                        m.route('/' + match[1])
                    } else {
                        m.route('/')
                    }
                    return data
                })
            }
            scope.update = function(e) {
                scope.item[e.target.name] = e.target.value
            }
            scope.remove = function(e) {
                e.preventDefault()
                if (!scope.item.id) {
                    return
                }
                budget.remove(scope.item).then(function(data) {
                    if (match && match[1] !== undefined) {
                        m.route('/' + match[1])
                    } else {
                        m.route('/')
                    }
                    return data
                })
            }

            return scope
        },
        view: function(scope) {
            let date = moment(scope.currentDate, 'YYYY-MM').startOf('month')
            let last = date.clone().subtract(1, 'month').format('YYYY-MM')
            let next = date.clone().add(1, 'month').format('YYYY-MM')

            let navigation = m('.row', [
                m('.col.s6', m('a.btn.grey', {
                    href: '#/' + last
                }, [m('i.mdi-navigation-arrow-back'), ' ', last])),
                m('.col.s6.right-align', m('a.btn.grey', {
                    href: '#/' + next
                }, [next, ' ', m('i.mdi-navigation-arrow-forward')]))
            ])

            return m('div.row', [
                m('div.col.s12.m5.l4', form(scope)),
                m('div.col.s12.m7.l8', [
                    viewBudgetList(scope.budget(), scope.categories(), scope.currentDate),
                    navigation
                ])
            ])
        }
    }
})
