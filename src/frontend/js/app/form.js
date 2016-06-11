import m from 'mithril'
import moment from 'moment'
import budget from '../api/budget.js'

function add (e) {
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
function update (e) {
    scope.item[e.target.name] = e.target.value
}
function remove (e) {
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

function formDescription (budgetItem, category) {
  let result = ''
  if (category && category.with_description == 1) {
    result = m('.row',
      m('.col.s12', [
        m('label', {
          for: 'description'
        }, 'Beschreibung'),
        m('input#description.text-input', {
          type: 'text',
          name: 'description',
          placeholder: 'Bemerkung',
          value: (budgetItem.description) ? budgetItem.description : ''
        })
      ])
    )
  }
  return result
}

function formCtrl (args) {
  this.budgetItem = m.prop(args.item || budget.create())
  this.budgetList = args.budget
  this.categoryList = args.categories
}

function formView (ctrl) {
  /*let category
  let categoriesList = scope.categories()

  if (!scope.item) {
    scope.item = budget.create()
  }

  if (scope.item) {
    if (scope.item.category_id) {
      category = categoriesList.find(c => c.id = scope.item.category_id)
    } else if (categoriesList && categoriesList[0]) {
      scope.item.category_id = categoriesList[0].id
    }
    if (scope.item.id) {
      deleteBtn = m('button.btn-floating.btn-large.red', {
        onclick: scope.remove
      }, m('i.large.mdi-action-delete'))
    }
  }*/
  let budgetItem = ctrl.budgetItem()
  let category = { id: 1, name: 'Bäcker' }
  let categoryOptions = ctrl.categoryList().map(item => {
    let attr = { value: item.id }
    if (category && item.id === category.id) {
      attr.selected = 'selected'
    }
    return m('option', attr, item.name)
  })
  let deleteBtn = ''

  return m('div.row.card-panel',
    m('form.col.s12', [
      m('div.row',
        m('.col.s12', [
          m('label', { for: 'amount' }, 'Betrag'),
          m('input#amount', {
            type: 'number',
            name: 'amount',
            placeholder: 'Wie ist der Betrag?',
            autofocus: '',
            required: '',
            step: 0.01,
            min: 0,
            value: budgetItem.amount
          })
        ])
      ),
      m('div.row', m('.col.s12', [
        m('label', { for: 'category' }, 'Kategorie'),
        m('select#category.browser-default', { name: 'category_id' }, categoryOptions)
      ])),
        formDescription(budgetItem, category),
        m('div.row',
            m('.col.s12', [
                m('label', { for: 'date' }, 'Datum'),
                m('input#date', {
                    type: 'date',
                    name: 'date',
                    value: moment(budgetItem.date).format('YYYY-MM-DD')
                })
            ])
        ),
        m('.row', [
            m('.col.s6', [
                m('input#type-spend', {
                    type: 'radio',
                    name: 'type',
                    value: 'spend',
                    checked: (budgetItem.type === 'spend')
                }),
                m('label', { for: 'type-spend' }, 'Ausgabe')
            ]),
            m('.col.s6', [
                m('input#type-income', {
                    type: 'radio',
                    name: 'type',
                    value: 'income',
                    checked: (budgetItem.type === 'income')
                }),
                m('label', { for: 'type-income' }, 'Einnahme')
            ])
        ]),
        m('div', [
            deleteBtn,
            m('.right', m('button.btn-floating.btn-large.green', { type: 'submit' }, m('i.large.mdi-action-done')))
        ])
    ])
  )
}

export default {
  controller: formCtrl,
  view: formView
}
