import m from 'mithril'
import moment from 'moment'
import categories from '../api/categories.js'
import budget from '../api/budget.js'

function formDescription(scope, category) {
    var result = ''
    if (category && category.with_description === 1) {
        result = m('.row',
            m('.col.s12', [
                m('label', {
                    for: 'description'
                }, 'Beschreibung'),
                m('input#description.text-input', {
                    type: 'text',
                    name: 'description',
                    placeholder: 'Bemerkung',
                    onchange: scope.update,
                    value: (scope.item.description) ? scope.item.description : ''
                })
            ])
        )
    }
    return result
}

export default function(scope) {
    let category = undefined
    let deleteBtn = ''
    let categoriesList = scope.categories()

    if (!scope.item) {
        scope.item = budget.create()
    }

    if (scope.item) {
        if (scope.item.category_id) {
            category = categoriesList.find(c => c.id = scope.item.category_id)
        } else if (categoriesList[0]) {
            scope.item.category_id = categoriesList[0].id
        }

        if (scope.item.id) {
            deleteBtn = m('button.btn-floating.btn-large.red', {
                onclick: scope.remove
            }, m('i.large.mdi-action-delete'))
        }
    }

    return m('div.row.card-panel', m('form.col.s12', {
        onsubmit: scope.add
    }, [
        m('div.row',
            m('.col.s12', [
                m('label', {
                    for: 'amount'
                }, 'Betrag'),
                m('input#amount', {
                    type: 'number',
                    name: 'amount',
                    placeholder: 'Wie ist der Betrag?',
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
            m('label', {
                for: 'category'
            }, 'Kategorie'),
            m('select#category.browser-default', {
                name: 'category_id',
                onchange: scope.update
            }, categoriesList.map(function(item) {
                var attr = {
                    value: item.id
                }
                if (category !== undefined) {
                    if (category === item) {
                        attr.selected = 'selected'
                    }
                }
                return m('option', attr, item.name)
            }))
        ])),
        formDescription(scope, category),
        m('div.row',
            m('.col.s12', [
                m('label', {
                    for: 'date'
                }, 'Datum'),
                m('input#date', {
                    type: 'date',
                    name: 'date',
                    onchange: scope.update,
                    value: moment(scope.item.date).format('YYYY-MM-DD')
                })
            ])
        ),
        m('.row', [
            m('.col.s6', [
                m('input#type-spend', {
                    type: 'radio',
                    name: 'type',
                    value: 'spend',
                    onchange: scope.update,
                    checked: (scope.item.type === 'spend')
                }),
                m('label', {
                    for: 'type-spend'
                }, 'Ausgabe')
            ]),
            m('.col.s6', [
                m('input#type-income', {
                    type: 'radio',
                    name: 'type',
                    value: 'income',
                    onchange: scope.update,
                    checked: (scope.item.type === 'income')
                }),
                m('label', {
                    for: 'type-income'
                }, 'Einnahme')
            ])
        ]),
        m('div', [
            deleteBtn,
            m('.right', m('button.btn-floating.btn-large.green', {
                type: 'submit'
            }, m('i.large.mdi-action-done')))
        ])
    ]))
}
