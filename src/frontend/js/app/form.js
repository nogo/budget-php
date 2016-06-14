import m from 'mithril'
import moment from 'moment'
import budget from '../api/budget.js'

function formDescription (budgetItem, category) {
  if (!category || !category.with_description || category.with_description !== 1) {
    return ''
  }

  return m('.row',
    m('.col.s12', [
      m('label', { for: 'description' }, 'Beschreibung'),
      m('input#description.text-input', {
        type: 'text',
        name: 'description',
        placeholder: 'Bemerkung',
        oninput: m.withAttr('value', (value) => { budgetItem.description = value }),
        value: (budgetItem && budgetItem.description) ? budgetItem.description : ''
      })
    ])
  )
}

function formCtrl (args) {
  console.log(args, 'test')
  this.budgetItem = m.prop(args.item || budget.create())
  this.budgetList = args.budget
  this.categoryList = args.categories
}

function formView (ctrl) {
  let budgetItem = ctrl.budgetItem()
  if (budgetItem && !budgetItem.category_id) {
    budgetItem.category_id = ctrl.categoryList()[0].id
  }
  let category = ctrl.categoryList().find(item => item.id === budgetItem.category_id)
  let categoryOptions = ctrl.categoryList().map(item => {
    let attr = { value: item.id }
    if (category && item.id === category.id) {
      attr.selected = 'selected'
    }
    return m('option', attr, item.name)
  })
  let deleteBtn = ''
  if (budgetItem && budgetItem.id) {
    deleteBtn = m('button.btn-floating.btn-large.red', {
      onclick: (e) => {
        if (e) e.preventDefault()
        return budget.remove(budgetItem)
      }
    }, m('i.large.mdi-action-delete'))
  }

  return m('div.row.card-panel',
    m('form.col.s12', { onsubmit: (e) => {
      if (e) e.preventDefault()
      ctrl.budgetItem(budgetItem)
      if (budget.persist(budgetItem)) {
        m.route('/')
      }
    }}, [
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
            onchange: m.withAttr('value', (value) => { budgetItem.amount = parseFloat(value, 10) }),
            value: budgetItem.amount
          })
        ])
      ),
      m('div.row', m('.col.s12', [
        m('label', { for: 'category' }, 'Kategorie'),
        m('select#category.browser-default', {
          name: 'category_id',
          'data-type': 'integer',
          onchange: m.withAttr('value', (value) => { budgetItem.category_id = parseInt(value, 10) })
        }, categoryOptions)
      ])),
      formDescription(budgetItem, category),
      m('div.row',
        m('.col.s12', [
          m('label', { for: 'date' }, 'Datum'),
          m('input#date', {
            type: 'date',
            name: 'date',
            oninput: m.withAttr('value', (value) => { budgetItem.date = moment(value).format('YYYY-MM-DD') }),
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
            onchange: m.withAttr('value', (value) => { budgetItem.type = value }),
            checked: (budgetItem.type === 'spend')
          }),
          m('label', { for: 'type-spend' }, 'Ausgabe')
        ]),
        m('.col.s6', [
          m('input#type-income', {
            type: 'radio',
            name: 'type',
            value: 'income',
            onchange: m.withAttr('value', (value) => { budgetItem.type = value }),
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
