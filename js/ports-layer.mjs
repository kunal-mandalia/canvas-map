import { store } from './store.mjs'
import { FPS, dpr } from './util.mjs'

const fps = new FPS()

const canvas = document.getElementById('ports-layer')
const ctx = canvas.getContext('2d')

function latLongToXY(lat, long) {
  const x = (((long + 180) / 360) * canvas.width)
  const y = ((((-1 * lat) + 90) / 180) * canvas.height)
  return [Math.floor(x), Math.floor(y)]
}

async function getPorts () {
  const rawPorts = await fetch("/assets/ports.json")
    .then(res => res.json())

  store.setState({
    ports: {
      raw: rawPorts,
      instances: Object.values(rawPorts)
        .filter(port => port.coordinates)
        .map((port, index) => {
          const [long, lat] = port.coordinates
          const [x, y] = latLongToXY(lat, long)
          return new Port(`port-${index}`, x, y, 3, port.name, port.coordinates)
        })
    }
  })
}

class Port {
  constructor(id, x, y, radius, name, coordinates) {
    this.id = id
    this.x = x
    this.y = y
    this.radius = radius
    this.name = name
    this.coordinates = coordinates
  }

  drawHover = () => {
    const { id, x, y, radius, name } = this
    foreground.tooltip[id] = () => {
      const padding = 30
      ctx.beginPath()
      
      ctx.fillStyle = "white";
      ctx.fillRect(x + radius + padding, y - radius, 300, 160);

      ctx.font = "20pt sans-serif";
      ctx.fillStyle = "black";
      ctx.fillText(`#${id}`, x + radius + (2 * padding), y + padding);

      ctx.fillText(`${name}`, x + radius + (2 * padding), y + (2 * padding));
  
      ctx.font = "16pt sans-serif";
      ctx.fillText(`x: ${x}`, x + radius + (2 * padding), y + (3 * padding));
      ctx.fillText(`y: ${y}`, x + radius + (2 * padding), y + (4 * padding));
      ctx.fillText(`r: ${radius}`, x + radius + (2 * padding), y + (5 * padding));
    }
  }

  draw = () => {
      const { id, x, y, radius } = this
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2, false)
      ctx.fillStyle = 'white'
      ctx.stroke()
      ctx.fill()
  }
}

function drawFps() {
  document.getElementById('fps-value').innerHTML = fps.history.length
}

function draw() {
  const { ports: { instances } } = store.getState()
  instances.forEach(port => port.draw())
  drawFps()
  store.setState({ fps: { ports: fps.tick() } })
}

function renderPorts() {
  window.requestAnimationFrame(draw)
}

function isCursorInPortRadius({x,y}, port) {
  const bound = port.radius
  return (x - port.x > -bound)
    && (x - port.x <= bound)
    && (y - port.y > -bound)
    && (y - port.y <= bound)
}

function setPortsTooltip() {
  const { mouse } = store.getState()
  const tooltip = document.getElementById('tooltip')
  const tooltipTitle = document.getElementById('tooltip-title')
  const tooltipBody = document.getElementById('tooltip-body')

  if (mouse.isOnCanvas) {
    const port = store.getState().ports.instances.find(port => isCursorInPortRadius(mouse, port))
    if (port) {
      const [long, lat] = port.coordinates
      tooltip.style.top = `${mouse.y / 2 }px`
      tooltip.style.left = `${mouse.x / 2 }px`
      tooltip.style.display = `block`
      tooltipTitle.innerHTML = `${port.name}`
      tooltipBody.innerHTML = `<small>${lat} ${long}</small>`
    } else {
      tooltip.style.display = `none`
    }
  }
}

export {
  canvas,
  ctx,
  getPorts,
  renderPorts,
  setPortsTooltip
}