import m from 'mithril'

function navigationCtrl (args) {
  this.last = m.prop(args.last);
  this.next = m.prop(args.next);
}

function navigationView (ctrl) {
  return m('.row', [
    m('.col.s6',
      m('a.btn.grey', { href: '#/' + ctrl.last() }, [
        m('i.mdi-navigation-arrow-back'), ' ', ctrl.last()
      ])),
    m('.col.s6.right-align',
      m('a.btn.grey', { href: '#/' + ctrl.next() }, [
        ctrl.next(), ' ', m('i.mdi-navigation-arrow-forward')
      ]))
  ]);
}

export default {
  controller: navigationCtrl,
  view: navigationView
}
