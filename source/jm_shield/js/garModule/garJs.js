/**
 * Created by John Gorven on 2017/2/10.
 */
/**
 * component name:terminal-like type
 * class name: gar-terminal-like
 * html dom structure must be seeming to this:
    <p class="gar-terminal-like" >
        <label for="account">ACCOUNT:</label><input id="account" >
        <span><span></span><b></b></span>
    </p>
 *
 */
(function () {
  var aTerLike = getEls('.gar-terminal-like'), spanSup, spanSub, b, len = aTerLike.length
    // dom
  var frag = document.createDocumentFragment()
  for (;len--;) {
    oInput = aTerLike[len].querySelector('input')

        // create
    spanSup = document.createElement('span')
    spanSub = document.createElement('span')
    b = document.createElement('b')

        // style
    gar.addClass(oInput, 'farToUnseen')
    gar.addClass(spanSup, 'relative')
    gar.addClass(spanSub, 'inline-block')

        // append
    spanSup.appendChild(spanSub)
    spanSup.insertBefore(b, null)
    frag.appendChild(spanSup)
    aTerLike[len].insertBefore(frag, null)

        // event listener
    gar.addHandler(aTerLike[len], 'click', oInput.focus, false)
    gar.addHandler(oInput, 'keyup', function (e) { transform(this, e) }, false)
  }
    // show words in <input> on <span> in way of terminal-like
  function transform (from, e) {
    e = gar.getEvent(e)
        // visual area
    var tw = e.target.parentNode.childNodes[4].firstChild
    tw.innerHTML = from.value
  }
    // promise the <input> appearance not to be ugly
  for (var aInp = document.querySelectorAll('input'), l = aInp.length; l--;) {
    if (!aInp[l].getAttribute('maxlength')) { aInp[l].setAttribute('maxlength', 20) }
  }
})();
/**
 * component name:canvas modal
 * effect:using canvas to draw bg and content is still input element
 * class name: canvasModalKey - canvasModal - modalBody
 * html dom structure must be seeming to this:
     <p class="questionForSafety gar-canvasModalKey" id="questionForSafety">QUESTION&ANSWER</p>
     <div class="gar-canvasModal " >
     <div class="gar-modalBg"></div>
     <div class="gar-modalBody">
     <small class="tips">TIPS:<small>PLEASE FILL A QUESTION AND ANSWER TO FIND YOUR ACCOUNT!</small></small>
     <p class="que gar-terminal-like">
     <label for="que">QUESTION:</label><input type="text" id="que" required size="30">
     </p>
     <p class="ans gar-terminal-like">
     <label for="ans">ANSWER:</label><input type="text" id="ans" required size="20">
     </p>
     <p class="clearfix">
     <button type="button">CONFIRM</button>
     </p>
     </div>
     </div>
 */
(function () {
  function CanvasModal (oCanvasModal) {
    this.oCanvasModal = oCanvasModal
    this.oModalBg = oCanvasModal.querySelector('.gar-modalBg')
    this.oModalBody = oCanvasModal.querySelector('.gar-modalBody')
  }

  CanvasModal.prototype = {
    constructor: CanvasModal,
    drawBg: function (heading) {
      this.canM = this.oModalBg.querySelector('canvas')

      var _oModalBody = this.oCanvasModal,
        eleH = _oModalBody.querySelectorAll('p').length * 35 + 28,    // cuz element <p> n' element <small> are not fixed in height so we can only get their actual height via F12
        h = Math.max(200, 60 + eleH)

      if (this.canM.getContext) {
        var ctx = this.canM.getContext('2d')
        ctx.fillStyle = 'rgba(0,0,0,.6)'
                // border
        ctx.beginPath()

        ctx.strokeStyle = 'rgb(44,170,42)'
        ctx.lineWidth = 2
        ctx.lineCap = 'square'

        ctx.moveTo(10, 0)
        ctx.lineTo(490, 0)
        ctx.lineTo(500, 10)
        ctx.lineTo(500, h)
        ctx.lineTo(0, h)
        ctx.lineTo(0, 10)
        ctx.closePath()
        ctx.stroke()

                // canvasModal's navBox
        ctx.beginPath()

        ctx.lineCap = 'square'

        ctx.moveTo(10, 5)
        ctx.lineTo(490, 5)
        ctx.lineTo(495, 10)
        ctx.lineTo(495, 30)
        ctx.lineTo(5, 30)
        ctx.lineTo(5, 10)
        ctx.lineTo(10, 5)

        ctx.moveTo(467, 5)
        ctx.lineTo(467, 30)

        ctx.closePath()
        ctx.fillStyle = '#004100'
        ctx.fill()
        ctx.stroke()

                // heading
        ctx.font = '20px courier,courier_ser'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillStyle = 'rgb(44,170,42)'
        ctx.fillText(heading || 'INFO BOX', 250, 6)
        ctx.fillText('X', 481, 6)
      }
    },
    drawHeading: function () {
      var frag = document.createDocumentFragment()

            // create
      var canM = document.createElement('canvas'),
        oDragArea = document.createElement('div'),
        closeBtn = document.createElement('a'),
        _oModalBody = this.oCanvasModal

            // attr
      canM.setAttribute('width', 500)
      canM.setAttribute('height', Math.max(200, 60 + _oModalBody.querySelectorAll('p').length * 35 + 28))
      oDragArea.className = 'gar-dragArea'

            // append
      canM.appendChild(document.createTextNode('CANVAS IS NOT ALLOWED IN YOUR CURRENT BROWSER VERSION.PLEASE UPDATE YOUR BROWSER!'))
      closeBtn.appendChild(document.createTextNode('X'));
      (function () {
        for (var nodeArr = [canM, oDragArea, closeBtn], len = nodeArr.length; len--;)frag.appendChild(nodeArr[len])
      })()
      this.oModalBg.appendChild(frag)
            // add Class attr
      this.oDragArea = this.oModalBg.querySelector('.gar-dragArea')
    },
    openBox: function () {
            // except nodeName='#text'
      var _self = this,
        _key = _self.oCanvasModal.previousSibling,
        _oCanvasModal = _self.oCanvasModal,
        _firstInp = _oCanvasModal.querySelector('input')
      while (!_key.className || _key.className.indexOf('gar-canvasModalKey') == -1)_key = _key.previousSibling

      gar.addHandler(_key, 'click', function (e) {
        gar.addClass(_oCanvasModal, 'modalOpen')
        gar.removeClass({
          'unseen': _oCanvasModal,
          'modalDefault': _oCanvasModal,
          'modalClose': _oCanvasModal
        })

        _firstInp.focus()

                // ensure that box-dragging merely happens when box is opened
        _self.moveBox()
      }, false)

      _self.contentLimit()
    },
    moveBox: function () {
      var _CanvasModal = this.oCanvasModal,
        _DragArea = this.oDragArea

            // remove event when moving for unnecessary space using
      gar.addHandler(_DragArea, 'mousedown', dragStart, false)

      function dragStart (e) {
        e = gar.getEvent(e)
        var pageX = e.pageX,
          pageY = e.pageY,
          L, T
                // <=ie8
        if (pageX === undefined)pageX = e.clientX + (document.body.scrollLeft || document.documentElement.scrollLeft)
        if (pageY === undefined)pageY = e.clientY + (document.body.scrollTop || document.documentElement.scrollTop)
                // calculate the distance from cursor to oCanvasModal's inner-border
        L = pageX - gar.getEleLeft(_CanvasModal)
        T = pageY - gar.getEleTop(_CanvasModal)
                // ie:setCapture
        if (this.setCapture) this.setCapture(true)

                // dragMove listener
        gar.addHandler(document, 'mousemove', dragMove, false)
                // dragRelease listener
        gar.addHandler(document, 'mouseup', dragRelease, false)

        function dragMove (e) { // document:just to ensure however fast of mouse's moving is ok
          e = gar.getEvent(e)
          var pageX = e.pageX,
            pageY = e.pageY
                    // <=ie8
          if (pageX === undefined)pageX = e.clientX + (document.body.scrollLeft || document.documentElement.scrollLeft)
          if (pageY === undefined)pageY = e.clientY + (document.body.scrollTop || document.documentElement.scrollTop)
                    // oCanvasModal moves
          _CanvasModal.style.left = pageX - L + 'px'
          _CanvasModal.style.top = pageY - T + 'px'
        }
        function dragRelease () {
          gar.removeHandler(document, 'mousemove', dragMove, false)
          gar.removeHandler(document, 'mouseup', dragRelease, false)
                    // remove
          if (_DragArea.releaseCapture)_DragArea.releaseCapture()
        }
                // preventDefault event: pic, txt,...  can't be dragged in a default way
        return false
      }
    },
    contentLimit: function () {
      var _input = this.oModalBody.querySelectorAll('input')
      if (_input) {
        for (var len = _input.length; len--;) { _input[len].setAttribute('maxlength', '25') }
      }
    },
    closeBox: function () {
      var _self = this,
        _closeBtn = _self.oModalBg.querySelector('a'),
        _oCanvasModal = _self.oCanvasModal,
        _DragArea = _self.oDragArea

      gar.addHandler(_closeBtn, 'click', function () {
        gar.removeClass(_oCanvasModal, 'modalOpen')
        gar.addClass(_oCanvasModal, 'modalClose')
                // delay time must be smaller half than .modalClose's duration so that user can view the animation effect
        setTimeout(function () {
          gar.addClass(_oCanvasModal, 'unseen')
        }, 100)

                // remove event of boxMove
        gar.removeHandler(_DragArea, 'mousedown', _self.moveBox.dragStart, false)
      }, false)
    }
  }

  CanvasModal.fn = CanvasModal.prototype

  CanvasModal.fn.init = function (oCanvasModal) {
        // create instance
    var oCan = new CanvasModal(oCanvasModal)
    oCan.drawHeading()
    oCan.drawBg()
    oCan.openBox()
    oCan.closeBox()

    gar.addClass({
      'unseen': oCan.oCanvasModal,
      'modalDefault': oCan.oCanvasModal
    })
  }

    // init
  var aCanvasModal = getEls('.gar-canvasModal'), len = aCanvasModal.length
  while (len--) {
    CanvasModal.fn.init(aCanvasModal[len])
  }
})();

/**
 * component:progress bar
 * class name: gar-progressBar
 * html dom structure must be seeming to this:
       <div class="gar-progressBar"></div>
 */
(function () {
  function ProgressBar (obj) {
    this.oProgBar = obj
  }

  ProgressBar.fn = ProgressBar.prototype

  ProgressBar.fn.create = function (pTxt, version, url) {
    var frag = document.createDocumentFragment(),
      p = document.createElement('p'),
      small = document.createElement('small'),
      spanPer = document.createElement('span'),
      spanDetail = document.createElement('span'),
      div = document.createElement('div'),

      iLen = 19,
      arrNode = [div, small, p], arrNodeL = arrNode.length,
      spanArr = [spanDetail, spanPer], spanArrL = spanArr.length

    do div.insertBefore(document.createElement('i'), null); while (iLen--)

        // append
    p.appendChild(document.createTextNode(pTxt || 'HANDLING....'))
    spanPer.appendChild(document.createTextNode('0%: '))
    while (spanArrL--)small.appendChild(spanArr[spanArrL])
    while (arrNodeL--)frag.appendChild(arrNode[arrNodeL])
    this.oProgBar.insertBefore(frag, null)

    this.spanPer = this.oProgBar.querySelector('small').firstChild
    this.spanDetail = this.oProgBar.querySelector('small').lastChild
    this.aI = this.oProgBar.querySelectorAll('i')

    if (!version || version === 'ajax') this.msgSync(url)
    else this.animVersion()
  }

  ProgressBar.fn.msgSync = function (url) {
    var _self = this,
      _aI = this.aI,
      i = 0 // how many <i> has been added className now

        // ajax&progress
    var xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304)console.log('SUCCESSFUL!')
        else console.info('REQUEST WAS UNSUCCESSFUL: ' + xhr.status)
      }
    }
    xhr.onprogress = function (e) {
      e = gar.getEvent(e)
      if (e.lengthComputable) {
        var per = e.position / e.totalSize,
          times = per * 20 | 0// how many <i> should be added className now
        _self.dynamicMsg.apply(this, arguments)
        if (per == 1.0)xhr.onprogress = null// just use a time but related to dom
      }
    }
    xhr.open('get', url, false)
    xhr.send(null)
  }

  ProgressBar.fn.animVersion = function () {
    var _self = this,
      per = 0,
      i = 0,
      times = 4,
      _aI = _self.aI, timer

    timer = setInterval(function () {
      if (times >= 20)clearInterval(timer)
      i = _self.dynamicMsg.call(this, _self, i, per, _aI, times)
      per += 0.2
      if (per === 1) {
        _self.dynamicMsg.call(this, _self, i, per, _aI, times)
                // prepare enough time for progress bar to reach 100% and show animation
        setTimeout(function () { _self.autoClose() }, 300)
      }
      times += 4
    }, 300)
  }

  ProgressBar.fn.dynamicMsg = function (_self, i, per, _aI, times) {
    _self.spanPer.innerHTML = Math.round(per * 100) + '%: '
    _self.spanDetail.innerHTML = (function (per) {
      switch (true) {
        case per < 0.2:return 'SENDING REQUEST TO THE SERVER!'
        case per >= 0.2 && per < 0.4:return 'SEARCHING FOR YOUR INFO FROM DATABASE!'
        case per >= 0.4 && per < 0.6:return 'HANDLING RELATED CALCULATION IN THE SERVER!'
        case per >= 0.6 && per < 0.8:return 'GOT INFO AND READY TO SEND FROM THE SERVER!'
        case per >= 0.8 && per < 1.0:return 'RECEIVING THE DATA!'
        default :return 'DONE!'
      }
    })(per)
    while (i < times) {
      _aI[i].className = 'progressBar_show'
      i++
    }
    return i
  }

  ProgressBar.fn.autoClose = function () {
    var _oProgress = this.oProgBar
        // prevent from coming into scroll on the body
    gar.addClass({
      'noscroll': document.body,
      'modalClose': _oProgress,
      'closeProgressBar': _oProgress
    })
        // delay time must be smaller half than .modalClose's duration so that user can view the animation effect
    setTimeout(function () { gar.addClass(_oProgress, 'hide') }, 200)
  }

  ProgressBar.fn.init = function (ele) {
    new ProgressBar(ele).create(false, 'anim')
  }

  var progBar = getEls('.gar-progressBar'), len = progBar.length
  while (len--)ProgressBar.fn.init(progBar[len])
})()
