var newVdom = velement('div', {'id': 'container'}, [
  velement('h5', {style: 'color:red'}, ['simple virtual dom']),
  velement('p', ['hello world']),
  velement('ul', [velement('li', ['item #1']), velement('li', ['item #2']), velement('li', ['item #3'])])
])

var patches = diff(vdom, newVdom)
patch(rootnode, patches)

let oldTree = {
  'tagName': 'div',
  'props': {
    'id': 'container'
  },
  'children': [
    {
      'tagName': 'h1',
      'props': {
        'style': 'color:red'
      },
      'children': [
        'simple virtual dom'
      ],
      'count': 1
    },
    {
      'tagName': 'p',
      'props': {},
      'children': [
        'hello world'
      ],
      'count': 1
    },
    {
      'tagName': 'ul',
      'props': {},
      'children': [
        {
          'tagName': 'li',
          'props': {},
          'children': [
            'item #1'
          ],
          'count': 1
        },
        {
          'tagName': 'li',
          'props': {},
          'children': [
            'item #2'
          ],
          'count': 1
        }
      ],
      'count': 4
    }
  ],
  'count': 9
}






let newTree = {
  'tagName': 'div',
  'props': {
    'id': 'container'
  },
  'children': [
    {
      'tagName': 'h5',
      'props': {
        'style': 'color:red'
      },
      'children': [
        'simple virtual dom'
      ],
      'count': 1
    },
    {
      'tagName': 'p',
      'props': {},
      'children': [
        'hello world'
      ],
      'count': 1
    },
    {
      'tagName': 'ul',
      'props': {},
      'children': [
        {
          'tagName': 'li',
          'props': {},
          'children': [
            'item #1'
          ],
          'count': 1
        },
        {
          'tagName': 'li',
          'props': {},
          'children': [
            'item #2'
          ],
          'count': 1
        },
        {
          'tagName': 'li',
          'props': {},
          'children': [
            'item #3'
          ],
          'count': 1
        }
      ],
      'count': 6
    }
  ],
  'count': 11
}