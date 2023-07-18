import Vue from 'vue'
import Chain from './chain'
import DialogComponent from './Dialog.vue'
import Queue, { methods } from './queue'

const chain = new Chain()
const queue = new Queue()

let instance

function isInDocument(element) {
  return document.body.contains(element)
}

function initInstance() {
  if (instance) {
    instance.$destroy()
  }

  instance = new (Vue.extend(DialogComponent))({
    el: document.createElement('div')
  })

  document.body.appendChild(instance.$el)

  instance.$on('input', value => {
    instance.value = value
  })
}

function Dialog(options) {
  return new Promise((resolve, reject) => {
    if (!instance || !isInDocument(instance.$el)) {
      initInstance()
    }
    const dialogComponent = Dialog.routes.find(item => item.key === options.key)?.component

    Object.assign(
      instance,
      Dialog.currentOptions,
      options,
      { dialogComponent },
      {
        resolve,
        reject
      }
    )

    if (!dialogComponent) {
      instance.reject({
        action: 'error',
        message: '找不到对应弹窗组件，请检查传入的name是否有对应的组件'
      })
      instance.value = false
    }
  })
}

Dialog.defaultOptions = {
  value: true,
  component: null,
  params: null,
  position: 'center',
  overlayStyle: null,
  beforeClose: null,
  callback: (action, params) => {
    try {
      instance.resolve({ action, params })
    } catch (error) {
      instance.reject({
        action: 'error',
        params: JSON.stringify(error) || '未知错误'
      })
    }
  }
}

Dialog.routes = []

Dialog.close = () => {
  if (instance) {
    instance.value = false
  }
}
Dialog.closePromisify = () => {
  if (instance) {
    instance.value = false
    instance.resolve({ action: 'close', params: null })
  }
}
Dialog.init = routes => {
  Dialog.routes = routes
}

Dialog.add = routes => {
  if (!Array.isArray(routes)) {
    throw new Error('routes is not Array')
  }
  routes.forEach(element => {
    const index = Dialog.routes.findIndex(item => item.key === element.key)
    if (index === -1) {
      Dialog.routes.push(element)
    } else {
      Dialog.routes.splice(index, 1, element)
    }
  })
}

Dialog.chain = chain

Dialog.immediate = async options => chain.handler(Dialog, options)

Dialog.resetOptions = () => {
  Dialog.currentOptions = { ...Dialog.defaultOptions }
}

Dialog.resetOptions()

methods.forEach(method => {
  Dialog[method] = options => queue[method](() => Dialog.immediate(options))
})

export default Dialog
