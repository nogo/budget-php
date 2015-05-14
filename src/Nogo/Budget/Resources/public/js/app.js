"use strict";
numeral.language('de');
/*
 * TODO
 * - Background sync on revisiting tab
 * -
 *
 */
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

  var viewBudgetListItem = function (currentDate, title, item) {
    title = title || 'Unbekannt';

    var result = [m('span.title', title)],
            attr = {},
            itemClass = '';

    if (item) {
      if (item.id) {
        attr.href = '#/' + currentDate + '/' + item.id;
      }

      switch (item.type) {
        case 'income':
          itemClass = '.green-text';
          break;
        default:
          itemClass = '.red-text';
      }

      if (item.description) {
        result.push(m('span.description', item.description));
      }


      if (item.amount) {
        result.push(m('span.secondary-content.amount' + itemClass, numeral(item.amount).format('0,0.00 $')));
      }
    }

    return m('a.collection-item.list-item' + itemClass, attr, result);
  };

  var viewBudgetList = function (collection, categories, currentDate) {
    collection = collection || [];

    var currentDate = currentDate || moment().format('YYYY-MM');
    var header;
    var filtered = collection.filter(function (item) {
      return moment(item.date).format('YYYY-MM') === currentDate;
    });
    var result = [];

    if (filtered.length > 0) {
      result = filtered.map(function (item) {
        var title = 'Nicht definiert',
                cid = parseInt(item.category_id),
                result = [];
        if (cid > 0) {
          title = categories.find(cid).name;
        }
        if (!header || header != item.date) {
          header = item.date;
          result.push(m('div.collection-header', moment(header).format('DD.MM.YYYY')));
        }
        result.push(viewBudgetListItem(currentDate, title, item));
        return result;
      });
    } else {
      result.push(viewBudgetListItem('Keine Einträge gefunden.'));
    }
    result.unshift(m('div.collection-header.center-align', currentDate));

    return m('div.collection.with-header', result);
  };

  var modules = {
    record: {
      controller: function () {
        var scope = {};

        // add resources to scope
        scope.categories = resources.categories;
        scope.budget = resources.budget;
        scope.currentDate = moment().format('YYYY-MM');
        scope.item = scope.budget.empty();

        var param = m.route.param('param');
        if (param) {
          var match = param.match(/(\d{4}\-\d{2})?\/?(\d+)?/);
          
          if (match[1] !== undefined) {
            scope.currentDate = match[1];
          }

          if (match[2] !== undefined) {
            scope.item = scope.budget.find(match[2]);
            if (!scope.item.amount) {
              if (match[1] !== undefined) {
                m.route('/' + match[1]);
              } else {
                m.route('/');
              }
            }
          }
        }

        scope.add = function (e) {
          e.preventDefault();
          if (!scope.item.amount) {
            return;
          }
          scope.budget.persist(scope.item).then(function (data) {
            scope.item = scope.budget.empty();
            if (match[1] !== undefined) {
              m.route('/' + match[1]);
            } else {
              m.route('/');
            }
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
            if (match[1] !== undefined) {
              m.route('/' + match[1]);
            } else {
              m.route('/');
            }
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

          if (!scope.item) {
            scope.item = scope.budget.empty();
          }

          if (scope.item) {
            if (scope.item.category_id) {
              category = scope.categories.find(scope.item.category_id);
            } else if (scope.categories.first()) {
              scope.item.category_id = scope.categories.first().id;
            }

            if (scope.item.id) {
              deleteBtn = m('button.btn-floating.btn-large.red', {onclick: scope.remove}, m('i.large.mdi-action-delete'));
            }
          }


          return m('div.row.card-panel', m('form.col.s12', {onsubmit: scope.add}, [
            m('div.row',
              m('.col.s12', [
                m('label', {for : 'amount'}, 'Betrag'),
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
                m('label', { for: 'type-spend'}, 'Ausgabe')
              ]),
              m('.col.s6', [
                m('input#type-income', { 
                  type: 'radio',
                  name: 'type',
                  value: 'income',
                  onchange: scope.update,
                  checked: (scope.item.type === 'income')
                }),
                m('label', { for: 'type-income'}, 'Einnahme')
              ])
            ]),
            m('div', [
              deleteBtn,
              m('.right', m('button.btn-floating.btn-large.green', {type: 'submit'}, m('i.large.mdi-action-done')))
            ])
          ]));
        }
      },
      view: function (scope) {
        return m('div.row', [
          m('div.col.s12.m5.l4', this.views.form(scope)),
          m('div.col.s12.m7.l8', viewBudgetList(scope.budget.findAll(), scope.categories, scope.currentDate))
        ]);

      }
    }
  };

  m.route.mode = "hash";
  m.route(document.getElementById('app'), '/', {
    '/': modules.record,
    '/:param...': modules.record
  });

})(document, m, _, moment, numeral);