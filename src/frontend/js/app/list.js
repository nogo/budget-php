import m from 'mithril'
import moment from 'moment'
import viewBudgetListItem from './item.js'

export default function budgetListView (budget, categories, currentDate) {
    budget = budget || []
    currentDate = currentDate || moment().format('YYYY-MM')

    let header
    let filtered = budget.filter(function(item) {
        return moment(item.date).format('YYYY-MM') === currentDate
    })
    let result = []

    if (filtered.length > 0) {
        result = filtered.map(function(item) {
            let title = 'Nicht definiert'
            let result = []

            var c = categories.find(c => c.id === item.category_id)
            if (c) {
                title = c.name
            }

            if (!header || header != item.date) {
                header = item.date
                result.push(m('div.collection-header', moment(header).format('DD.MM.YYYY')))
            }

            result.push(viewBudgetListItem(title, item, currentDate))
            return result
        })

        let total = filtered
          .map(item => (item.type === 'spend' ? -1 : 1) * parseFloat(item.amount))
          .reduce((prev, curr) => (prev || 0) + curr);
        if (total > 0) {
            result.unshift(viewBudgetListItem('Gesamt', {
                amount: total
            }))
        }
    } else {
        result.push(viewBudgetListItem('Keine Einträge gefunden.'))
    }
    result.unshift(m('div.collection-header.center-align', currentDate))

    return m('div.collection.with-header', result)
}
