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

    var module = {
        controller: function () {
            var budget = {
                build: function () {
                    return {
                        amount: 0.0,
                        category_id: 0,
                        date: moment().format('YYYY-MM-DD')
                    };
                }
            };
            budget.newBudget = budget.build();

            budget.add = function (e) {
                if (budget.newBudget.amount === 0) {
                    return;
                }
                
                budget.newBudget.type = e.target.name;
                store.add('budget', budget.newBudget);
                budget.newBudget = budget.build();
            };

            budget.update = function (e) {
                budget.newBudget[e.target.name] = e.target.value;
            };
            
            return budget;
        },
        view: function (scope) {
            return m('header', [
                m('h1', 'Ausgabe'),
                m('form', [
                    m('div.form-group', [
                        m('select#category.form-control', {
                            name: 'category_id',
                            onchange: scope.update
                        }, store.findAll('categories').map(function (item) {
                            var attr = { value: item.id };
                            if (scope.newBudget.category_id == item.id) {
                                attr.selected = 'selected';
                            }
                            return m('option', attr, item.name);
                        }))
                    ]),
                    m('div.form-group', [
                        m('input#date.form-control', {
                            type: 'date',
                            name: 'date',
                            onchange: scope.update,
                            value: scope.newBudget.date
                        })
                    ]),
                    m('div.form-group', [
                        m('input#amount.form-control', {
                            type: 'number',
                            name: 'amount',
                            placeholder: 'Was wurde Ausgegeben?',
                            autofocus: '',
                            onchange: scope.update,
                            value: scope.newBudget.amount
                        })
                    ]),
                    m('input#btn-spend.btn.btn-primary.btn-block', {
                        type: 'submit',
                        name: 'spend',
                        value: 'Ausgabe',
                        onclick: scope.add
                    }),
                    m('input#btn-income.btn.btn-block', {
                        type: 'button',
                        name: 'income',
                        value: 'Einnahme',
                        onclick: scope.add
                    })
                ])
            ]);
        }
    };

    m.module(document.getElementById('app'), module);

})(document, m, moment);