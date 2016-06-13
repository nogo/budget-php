import m from 'mithril'
import moment from 'moment'

function navigationCtrl (args) {
  const date = moment(args.currentDate, 'YYYY-MM').startOf('month')
  this.last = m.prop(date.clone().subtract(1, 'month').format('YYYY-MM'))
  this.next = m.prop(date.clone().add(1, 'month').format('YYYY-MM'))
}

function navigationView (ctrl) {
  return m('.row', [
    m('.col.s6',
      m('a.btn.grey', { href: '/' + ctrl.last(), config: m.route }, [
        m('i.mdi-navigation-arrow-back'), ' ', ctrl.last()
      ])),
    m('.col.s6.right-align',
      m('a.btn.grey', { href: '/' + ctrl.next(), config: m.route }, [
        ctrl.next(), ' ', m('i.mdi-navigation-arrow-forward')
      ]))
  ])
}

export default {
  controller: navigationCtrl,
  view: navigationView
}
