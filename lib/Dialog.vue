<script>
export default {
  inheritAttrs: false,
  name: 'DialogComponent',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    params: {
      type: Object,
      default: () => ({})
    },
    position: {
      type: String,
      default: 'center'
    },
    closeOnClickOverlay: {
      type: Boolean,
      default: false
    },
    overlayStyle: {
      type: Object,
      default: () => ({})
    },
    beforeClose: {
      type: Function
    },
    callback: {
      type: Function
    },
    dialogComponent: {
      type: Function
    }
  },
  directives: {
    'popup-fixed': {
      inserted() {
        const scrollTop = document.body.scrollTop || document.documentElement.scrollTop
        document.body.style.cssText += `position: fixed; width: 100%; top: -${scrollTop}px;`
      },
      unbind() {
        const {body} = document
        body.style.position = ''
        const {top} = body.style
        // eslint-disable-next-line no-multi-assign, radix
        document.body.scrollTop = document.documentElement.scrollTop = -parseInt(top)
        body.style.top = ''
      }
    }
  },
  methods: {
    handleAction(action = 'close', params = null) {
      this.$emit('input', false)
      if (this.callback) {
        this.callback(action, params)
      }
    },
    onAction(action = 'close', params = null) {
      if (this.beforeClose && action !== 'close') {
        this.beforeClose({
          params,
          close: () => {
            this.handleAction(action, params)
          }
        })
        return
      }
      this.handleAction(action, params)
    }
  },
  render(h) {
    return h('div', [
      h('transition', {props: {name: 'fade'}}, [
        h('div', {
          class: 'dialog-overlay',
          style: {
            ...this.overlayStyle
          },
          directives: [
            {
              name: 'show',
              value: this.value
            }
          ],
          on: {
            click: () => this.closeOnClickOverlay && this.onAction('clickOverlay', null)
          }
        })
      ]),
      h('transition', {props: {name: this.position}}, [
        this.value
          ? h(this.dialogComponent, {
              class: ['dialog-content', `dialog-content--${this.position}`],
              props: {
                params: this.params
              },
              directives: [
                {
                  name: 'popup-fixed'
                }
              ],
              on: {
                action: this.onAction
              }
            })
          : null
      ])
    ])
  }
}
</script>
<style>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  z-index: 999;
}
.dialog-content {
  position: fixed;
  transform-origin: center center;
  z-index: 1000;
}
.dialog-content--center {
  top: 45%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
}
.dialog-content--bottom {
  bottom: 0;
  left: 50%;
  transform: translate3d(-50%, 0, 0);
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.center-enter-active,
.center-leave-active {
  transition: all 0.3s;
}
.center-enter,
.center-leave-to {
  opacity: 0.1;
  transform: translate3d(-50%, -50%, 0) scale(0.7);
}
.bottom-enter-active,
.bottom-leave-active {
  transition: all 0.3s;
}
.bottom-enter,
.bottom-leave-to {
  opacity: 0.1;
  transform: translate3d(-50%, 100%, 0);
}
</style>
