import { store } from './store.mjs'
import { DPR, RATIO } from './constants.mjs'

function sizeCanvas(canvas) {
  canvas.style.width = `${window.innerWidth}px`
  canvas.style.height = `${window.innerWidth / 2}px`
  canvas.style.position = 'absolute'
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * RATIO
  canvas.height = rect.height * RATIO
  return canvas
}

function clearCanvas(canvas, context) {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

class FPS {
  constructor() {
    this.history = []
    this.duration = 1000
  }

  append (now) {
    this.history.push(now)
  }

  tick () {
    const now = Date.now()
    this.history = this.history.filter(t => now - t < this.duration)
    this.append(now)
    return this.history.length
  }
}

function setMouseState(e) {
  store.setState(() => {
    const x = e.x * DPR
    const y = e.y * DPR
    const isOnCanvas = (e.x >= 0 && (e.x <= window.innerWidth )) && (e.y >= 0 && (e.y <= window.innerWidth / 2))
    return {
      mouse: {
        x,
        y,
        isOnCanvas
      }
    }
  })
}

function Debounce (ms = 100) {
  this.ms = ms
  this.lastCall = null
  this.idle = true

  this.throttle = fn => {
    this.lastCall = {
      fn,
      ts: Date.now()
    }
    if (this.idle) {
      this.wait()
    }
  }

  this.wait = () => {
    this.idle = false
    setTimeout(() => {
      if (this.lastCall) {
        if (Date.now() - this.lastCall.ts > ms) {
          this.lastCall.fn()
          this.lastCall = null
        } else {
          this.wait()
        }
      }
      this.idle = true
    }, this.ms)
  }
}
const debounce = new Debounce()

export {
  DPR,
  FPS,
  setMouseState,
  sizeCanvas,
  clearCanvas,
  Debounce,
  debounce
}