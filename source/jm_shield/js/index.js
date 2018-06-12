/**
 * Created by jm_hello on 2016/12/31.
 */
/**
 * login
 */
var loginForm = document.forms[0],
  loginBtn = loginForm.loginBtn
// submit
loginBtn.onclick = function () {
  gar.ajax()
}
/**
 * register
 */
// skip
var oReg_skip = getEl('#registerSkip'),
  oCteBox = getEl('#cteBox'),
  oReg_box = getEl('#reg_box'),
  oBackToLogin = getEl('#backToLogin')
gar.addHandler(oReg_skip, 'click', function () {
  gar.removeClass(oReg_box, 'hide')
  gar.addClass(oCteBox, 'hide')
  getEl('#username').focus()
}, false)
gar.addHandler(oBackToLogin, 'click', function () {
  gar.removeClass(oCteBox, 'hide')
  gar.addClass(oReg_box, 'hide')
  getEl('#account').focus()
}, false)
