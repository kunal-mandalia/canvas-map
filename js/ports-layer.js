import { store } from './store.js'
import { FPS, clearCanvas, sizeCanvas } from './util.js'
import { DPR, RATIO } from './constants.js'

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

  store.setState(prevState => ({
    ports: {
      raw: rawPorts,
      instances: Object.values(rawPorts)
        .filter(port => port.coordinates)
        .filter(port => {
          const filter = prevState.menu.ports.filter ? prevState.menu.ports.filter.toLowerCase() : null
          return filter ?  port.name.toLowerCase().includes(filter) : true
        })
        .map((port, index) => {
          const [long, lat] = port.coordinates
          const [x, y] = latLongToXY(lat, long)
          const radius = 2 * RATIO
          return new Port(`port-${index}`, x, y, radius, port.name, port.coordinates)
        })
    }
  }))
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
  clearCanvas(canvas, ctx)
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
  const a = x * RATIO / DPR
  const b = y * RATIO / DPR
  return (a - port.x > -bound)
    && (a - port.x <= bound)
    && (b - port.y > -bound)
    && (b - port.y <= bound)
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
      tooltip.style.top = `${mouse.y / DPR }px`
      tooltip.style.left = `${mouse.x / DPR }px`
      tooltip.style.display = `block`
      tooltipTitle.innerHTML = `${port.name}`
      tooltipBody.innerHTML = `<small>${lat} ${long}</small>`
    } else {
      tooltip.style.display = `none`
    }
  }
}

function togglePortsMenu() {
  store.setState(prevState => {
    const isExpanded = prevState.menu.ports.isExpanded
    const menu = document.getElementById('menu')
    const ports = document.getElementById('sidebar-ports')

    if (isExpanded) {
      menu.style.display = 'block'
      ports.style.display = 'none'
    } else {
      menu.style.display = 'none'
      ports.style.display = 'block'
      sizeSidebarPorts()
    }
    
    return {
      menu: {
        ...prevState.menu,
        ports: {
          ...prevState.menu.ports,
          isExpanded: !isExpanded
        }
      }
    }
  })
}

function updatePortFilter (e) {
  store.setState(prevState => ({
    menu: {
      ...prevState.menu,
      ports: {
        ...prevState.menu.ports,
        filter: e.target.value
      }
    }
  }))
  getPorts()
    .then(() => {
      renderPorts()

      const portList = document.getElementById('port-list')
      const portListInnerHtml = store.getState().ports.instances.reduce((portListInnerHtml, port) => {
        portListInnerHtml += `<p class="port-list-item">${port.name}</p>`
        return portListInnerHtml
      }, "")
      portList.innerHTML = portListInnerHtml
      sizePortList()
  });
}

function sizeSidebarPorts () {
  const ports = document.getElementById('sidebar-ports')
  ports.style.height = `${(window.innerWidth / 2) - 50}px`
}

function sizePortList () {
  const sidebarPorts = document.getElementById('sidebar-ports')
  const portList = document.getElementById('port-list')

  const height = sidebarPorts.clientHeight - 125
  portList.style.height = `${height}px`
}

function handleResize () {
  sizeCanvas(canvas)
  sizeSidebarPorts()
  sizePortList()
}


function init () {
  sizeCanvas(canvas)
  sizePortList()
}

export {
  canvas,
  ctx,
  getPorts,
  renderPorts,
  setPortsTooltip,
  togglePortsMenu,
  updatePortFilter,
  sizePortList,
  init,
  handleResize
}