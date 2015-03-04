"use strict";
numeral.language('de');

(function (document, m, _, moment, numeral) {

    var resources = {};
    resources.categories = new Resource({
        url: 'api/categories',
        idAttribute: 'id',
        empty: {
            name: '',
            with_description: false
        }
    });
    resources.budget = new Resource({
        url: 'api/budget',
        idAttribute: 'id',
        sort: function (a, b) {
            var dateA = moment(a.date),
                    dateB = moment(b.date);
            var result = 0;
            if (dateA > dateB) {
                result = -1;
            } else if (dateA < dateB) {
                result = 1;
            }

            return result;
        },
        empty: {
            type: 'spend',
            date: moment().format('YYYY-MM-DD')
        }
    });

    var formDescription = function (scope, category) {
        var result = '';
        if (category && category.with_description === '1') {
            result = m('.row',
                m('.col.s12', [
                    m('label', {for : 'description'}, 'Beschreibung'),
                    m('input#description.text-input', {
                        type: 'text',
                        name: 'description',
                        placeholder: 'Bemerkung',
                        onchange: scope.update,
                        value: (scope.item.description) ? scope.item.description : ''
                    })
                ])
            );
        }
        return result;
    };

    var viewBudgetListItem = function (title, item) {
        title = title || 'Unbekannt';

        var result = [m('span.title', title)],
            attr = {},
            itemClass = '.red-text';

        if (item) {
            if (item.type && item.type === 'income') {
                itemClass = '.green-text';
            }
            if (item.amount) {
                result.push(m('span.secondary-content.amount' + itemClass, numeral(item.amount).format('0,0.00 $')));
            }

            attr.href = '#/' + item.id;
        }

        return m('a.collection-item.list-item' + itemClass, attr, result);
    };

    var viewBudgetList = function (collection, categories) {
        collection = collection || [];

        var header;
        var result = [];
        if (collection.length > 0) {
            result = collection.slice(0, 25).map(function (item) {
                var title = 'Nicht definiert', 
                    cid = parseInt(item.category_id),
                    result = [];
                if (cid > 0) {
                    title = categories.find(cid).name;
                }
                if (!header || header != item.date) {
                    header = item.date;
                    result.push(m('li.collection-header', moment(header).format('DD.MM.YYYY')))
                }
                result.push(viewBudgetListItem(title, item));
                return result;
            });
        } else {
            result.push(viewBudgetListItem('Keine Einträge gefunden.'));
        }

        return m('div.collection.with-header', result);
    };

    var modules = {
        record: {
            controller: function () {
                var scope = {};

                scope.categories = resources.categories;
                scope.budget = resources.budget;

                if (m.route.param('id')) {
                    scope.item = scope.budget.find(m.route.param('id'));
                } else {
                    scope.item = scope.budget.empty();
                }

                scope.add = function (e) {
                    e.preventDefault();
                    if (!scope.item.amount) {
                        return;
                    }
                    scope.budget.persist(scope.item).then(function (data) {
                        scope.item = scope.budget.empty();
                        return data;
                    });
                };
                scope.update = function (e) {
                    scope.item[e.target.name] = e.target.value;
                };
                scope.remove = function (e) {
                    e.preventDefault();
                    if (!scope.item.id) {
                        return;
                    }
                    scope.budget.remove(scope.item).then(function (data) {
                        m.route('/');
                        return data;
                    });
                };

                return scope;
            },
            views: {
                button: function (scope) {
                    return m('.fixed-action-btn', m('a.btn-floating.btn-large.green', {onclick: scope.add}, m('i.large.mdi-action-done')));
                },
                form: function (scope) {
                    var category = undefined,
                        deleteBtn = '';
                    if (scope.item) {
                        if (scope.item.category_id) {
                            category = scope.categories.find(scope.item.category_id);
                        } else if (scope.categories.first()) {
                            scope.item.category_id = scope.categories.first().id;
                        }
                    }

                    if (scope.item.id) {
                        deleteBtn = m('button.btn-floating.btn-large.red', { onclick: scope.remove }, m('i.large.mdi-action-delete'));
                    }

                    return m('div.row.card-panel', m('form.col.s12', { onsubmit: scope.add }, [
                        m('div.row',
                                m('.col.s12', [
                                    m('label', {for : 'amount'}, 'Ausgabe'),
                                    m('input#amount', {
                                        type: 'number',
                                        name: 'amount',
                                        placeholder: 'Wieviel wurde ausgegeben?',
                                        autofocus: '',
                                        required: '',
                                        step: 0.01,
                                        min: 0,
                                        onchange: scope.update,
                                        value: scope.item.amount
                                    })
                                ])
                                ),
                        m('div.row', m('.col.s12', [
                            m('label', {for : 'category'}, 'Kategorie'),
                            m('select#category.browser-default', {
                                name: 'category_id',
                                onchange: scope.update
                            }, scope.categories.findAll().map(function (item) {
                                var attr = {value: item.id};
                                if (category !== undefined) {
                                    if (category === item) {
                                        attr.selected = 'selected';
                                    }
                                }
                                return m('option', attr, item.name);
                            }))
                        ])),
                        formDescription(scope, category),
                        m('div.row',
                                m('.col.s12', [
                                    m('label', {for : 'date'}, 'Datum'),
                                    m('input#date', {
                                        type: 'date',
                                        name: 'date',
                                        onchange: scope.update,
                                        value: scope.item.date
                                    })
                                ])
                                ),
                        m('div', [
                            deleteBtn,
                            m('.right', m('button.btn-floating.btn-large.green', {type: 'submit'}, m('i.large.mdi-action-done')))
                        ])
                    ]));
                }
            },
            view: function (scope) {
                return [
                    this.views.form(scope),
                    viewBudgetList(scope.budget.findAll(), scope.categories)
                ];
            }
        }
    };

    m.route.mode = "hash";
    m.route(document.getElementById('app'), '/', {
        '/': modules.record,
        '/:id': modules.record
    });

})(document, m, _, moment, numeral);