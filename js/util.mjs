import { store } from './store.mjs'
 
const dpr = window.devicePixelRatio || 1

function sizeCanvas(canvas) {
  canvas.style.width = `${window.innerWidth}px`
  canvas.style.height = `${window.innerWidth / 2}px`
  canvas.style.position = 'absolute'
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  return canvas
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
    const x = e.x * dpr
    const y = e.y * dpr
    const isOnCanvas = (e.x >= 0 && e.x <= window.innerWidth) && (e.y >= 0 && e.y <= window.innerHeight / 2)
    return {
      mouse: {
        x,
        y,
        isOnCanvas
      }
    }
  })
}

export {
  dpr,
  FPS,
  setMouseState,
  sizeCanvas
}