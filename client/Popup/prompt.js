import Popup from './main.js'
import inheritPrototype from '../lib/inheritPrototype.js'

function Prompt (config) {
  Popup.call(this, config)
}

inheritPrototype(Prompt, Popup)

Popup.prototype.createBody = function () {
  let fragement = document.createDocumentFragment()
}

Popup.prototype.init = function () {

}
