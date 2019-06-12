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

export {
  DPR,
  FPS,
  setMouseState,
  sizeCanvas,
  clearCanvas
}