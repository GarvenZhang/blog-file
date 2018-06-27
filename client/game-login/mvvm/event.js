let uid = 0

/**
 * 自定义事件类
 */
export default class Event {

  constructor () {
    // 订阅者编号
    this.id = uid++
    // 订阅者列表
    this.subs = []
  }

  static target = null

  /**
   * 订阅
   * @param {Object} sub - 订阅者
   */
  listen (sub) {
    this.subs.push(sub)
  }

  depend () {
    Event.target.addEvent(this)
  }

  /**
   * 移除订阅者
   * @param {Object} sub - 订阅者
   */
  remove (sub) {

    const i = this.subs.indexOf(sub);
    (i !== -1) && this.subs.splice(i, 1)

  }

  /**
   * 通知订阅者
   */
  trigger () {
    this.subs.forEach(sub => sub.update())
  }

}
