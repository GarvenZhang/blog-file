import { addClass, removeClass, replaceClass } from '../../../client/lib/className'

describe('test/client/lib/className.test.js', function () {

  afterEach(function () {
    document.body.className = ''
  })

  test('addClass() should be ok', function () {

    addClass(document.body, 'a')
    addClass(document.body, 'a-b')
    addClass(document.body, 'a--b')

    expect(document.body.className).toBe('a a-b a--b')

  })

  test('removeClass() should be ok', function () {

    addClass(document.body, 'a')
    addClass(document.body, 'a-b')
    addClass(document.body, 'a--b')

    removeClass(document.body, 'a-b')

    expect(document.body.className).toBe('a a--b')

  })

  test('replaceClass() should be ok', function () {

    replaceClass(document.body, 'a', 'a-b')
    replaceClass(document.body, 'a-b', 'a')
    replaceClass(document.body, 'b', 'a-b')

    expect(document.body.className).toBe('b')

  })

})
