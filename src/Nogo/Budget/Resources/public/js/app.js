"use strict";
(function (document, m, moment) {
    var store = new Amygdala({
        config: {
            apiUrl: 'api',
            idAttribute: 'id',
            localStorage: true
        },
        schema: {
            categories: {
                url: '/categories'
            },
            budget: {
                url: '/budget'
            }
        }
    });

    m.startComputation();
    store.get('categories');
    store.get('budget').done(function () {
        m.endComputation();
    });

    var menu = {
        controller: function () {
            var scope = {};

            return scope;
        },
        view: function (scope) {
            return m('.nav-wrapper', [
                m('a.brand-logo', { href: '#/'}, [m('i.mdi-action-account-balance-wallet'), ' ', 'Budget']),
                m('a.button-collapse', {  }, m('i.mdi-navigation-menu')),
                m('ul.right.hide-on-med-and-down', [
                    m('li', m('a', { href: '#/expenses' }, [m('i.mdi-navigation-expand-less.left'), 'Ausgaben'])),
                    m('li', m('a', { href: '#/revenue' }, [m('i.mdi-navigation-expand-more.left'), 'Einnahmen'])),
                    m('li', m('a', { href: '#/report' }, [m('i.mdi-av-equalizer.left'), 'Report']))
                ]),
                m('ul.side-nav', [
                    m('li', m('a', { href: '#/expenses' }, [m('i.mdi-navigation-expand-less.left'), 'Ausgaben'])),
                    m('li', m('a', { href: '#/revenue' }, [m('i.mdi-navigation-expand-more.left'), 'Einnahmen'])),
                    m('li', m('a', { href: '#/report' }, [m('i.mdi-av-equalizer.left'), 'Report']))
                ])
            ]);
        }
    };

    var budget = {
        build: function (type) {
            return {
                amount: 0.0,
                type: type || 'spend',
                category_id: 0,
                date: moment().format('YYYY-MM-DD')
            };
        }
    };

    var form = function(scope) {
        return m('div.row', m('form.col.s12', {
            onsubmit: scope.add
        }, [
            m('div.row', 
                m('.input-field.col.s12', [
                    m('i.mdi-editor-attach-money.prefix'),
                    m('input#amount.text-input', {
                        type: 'number',
                        name: 'amount',
                        placeholder: 'Was wurde Ausgegeben?',
                        autofocus: '',
                        required: '',
                        onchange: scope.update,
                        value: scope.item.amount
                    })
                ])
            ),
            m('div.row', m('.input-field.col.s12', [
                m('select#category.browser-default', {
                    name: 'category_id',
                    onchange: scope.update
                }, scope.categories.map(function (item) {
                    var attr = { value: item.id };
                    if (scope.item.category_id == item.id) {
                        attr.selected = 'selected';
                    }
                    return m('option', attr, item.name);
                }))
            ])),
            m('div.row', 
                m('.input-field.col.s12', [
                    m('i.mdi-editor-insert-invitation.prefix'),
                    m('input#date', {
                        type: 'date',
                        name: 'date',
                        onchange: scope.update,
                        value: scope.item.date
                    })
                ])
            )
        ]));
    };

    var modules = {
        expenses: {
            controller: function () {
                var scope = {
                    type: 'spend'
                };

                scope.collection = store.findAll('budget', { type: scope.type });
                scope.categories = store.findAll('categories');
                scope.action = function () {
                    m.route('/record', {type: scope.type});
                };

                return scope;
            },
            views: {
                item: function (scope, item) {
                    var category = store.find('categories', item.category_id),
                        title = 'unkown';
                    if (category) {
                        title = category.name;
                    }
                    return m('li.collection-item', [
                        m('span.title', title),
                        m('p', item.amount)
                    ]);
                },
                button: function (scope) {
                    return m('.fixed-action-btn', m('a.btn-floating.btn-large.red', { onclick: scope.action }, m('i.large.mdi-content-add')));
                }
            },
            view: function (scope) {
                return m('header', [
                    m('h2', [m('i.mdi-navigation-expand-less'), 'Ausgaben']),
                    m('ul.collection', scope.collection.map(function (item) { return modules.expenses.views.item(scope, item); })),
                    modules.expenses.views.button(scope)
                ]);
            }
        },
        record: {
            controller: function () {
                var scope = {};

                scope.categories = store.findAll('categories');
                scope.item = budget.build(m.route.param('type'));
                scope.add = function (e) {
                    e.preventDefault();
                    if (scope.item.amount === 0) {
                        return;
                    }
                    store.add('budget', scope.item);
                    scope.item = budget.build();
                };
                scope.update = function (e) {
                    scope.item[e.target.name] = e.target.value;
                };

                return scope;
            },
            views: {
                button: function (scope) {
                    return m('.fixed-action-btn', m('a.btn-floating.btn-large.green', { onclick: scope.add }, m('i.large.mdi-action-done')));
                }
            },
            view: function (scope) {
                var header = [m('i.mdi-navigation-expand-less'), 'Ausgaben'];
                if (m.route.param('type') === 'income') {
                    header = [m('i.mdi-navigation-expand-more'), 'Einnahmen'];
                }

                return m('header', [
                    m('h2', header),
                    form(scope),
                    modules.record.views.button(scope)
                ]);
            }
        },
        revenue: {
            controller: function () {
                var scope = {
                    type: 'income'
                };

                scope.collection = store.findAll('budget', { type: scope.type });
                scope.action = function () {
                    m.route('/record', {type: scope.type});
                };

                return scope;
            },
            view: function (scope) {
                return m('header', [
                    m('h2', [m('i.mdi-navigation-expand-more'), 'Einnahmen']),
                    m('ul.collection', scope.collection.map(function (item) { return modules.expenses.views.item(scope, item); })),
                    modules.expenses.views.button(scope)
                ]);
            }
        }
    };

    m.module(document.getElementById('menu'), menu);
    m.route.mode = "hash";
    m.route(document.getElementById('app'), '/', {
        '/': modules.revenue,
        '/expenses': modules.expenses,
        '/revenue': modules.revenue,
        '/record': modules.record
    });

})(document, m, moment);