const canvas = document.getElementById('base-layer')
const ctx = canvas.getContext('2d')
const mouse = { x: null, y: null }
const dpi = window.devicePixelRatio || 1

export {
  canvas,
  ctx
}