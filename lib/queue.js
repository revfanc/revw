function Queue() {
  this.queue = []
  this.opened = false
  this.promise = Promise.resolve(null)
}

Queue.prototype.handler = function handler() {
  const { instance, resolve, reject } = this.queue.shift()
  instance()
    .then(resolve, reject)
    .finally(() => {
      if (this.queue.length) {
        this.next()
      } else {
        this.opened = false
      }
    })
}

Queue.prototype.next = function next() {
  return this.promise
    .then(() => this.handler.call(this))
    .catch(e =>
      setTimeout(() => {
        throw e
      })
    )
}

const methods = ['push', 'unshift']
methods.forEach(method => {
  Queue.prototype[method] = function (instance) {
    return new Promise((resolve, reject) => {
      this.queue[method]({
        instance,
        resolve,
        reject
      })
      if (!this.opened) {
        this.opened = true
        this.next()
      }
    })
  }
})

export { methods }
export default Queue
