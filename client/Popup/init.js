// confirm
import Confirm from './confirm.js'
import $ from '../lib/$.js'

var confirm = new Confirm()
confirm.init({
  header: 'hello',
  question: '是肥婆嘛？',
  yesText: '是的',
  noText: '不是'
})

$('#btn-open').onclick = confirm.open
