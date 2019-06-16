import { store } from './store.js'
import { getPorts, renderPorts } from './ports-layer.js'

const sidebars = ['ports']

function init () {
  const menuPorts = document.getElementById('menu-ports')
  const menuBackButtons = document.getElementsByClassName('menu-item-back')
  const menuPortsSearch = document.getElementById('input-port-filter')

  menuPorts.onclick = () => { toggleSidebar('ports') }
  for (let i = 0; i < menuBackButtons.length; i++) {
    menuBackButtons[i].onclick = () => { toggleSidebar('ports') }
  }
  menuPortsSearch.oninput = updatePortFilter
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
  });
}

function toggleSidebar(name) {
  store.setState(prevState => {
    const isExpanded = prevState.menu[name].isExpanded
    const menu = document.getElementById('menu')
    const sidebar = document.getElementById(`sidebar-${name}`)

    if (isExpanded) {
      menu.style.display = 'block'
      sidebar.style.display = 'none'
    } else {
      menu.style.display = 'none'
      sidebar.style.display = 'block'
      handleResize()
    }
    
    return {
      menu: {
        ...prevState.menu,
        [name]: {
          ...prevState.menu[name],
          isExpanded: !isExpanded
        }
      }
    }
  })
}

function sizeSidebar (name) {
  const sidebar = document.getElementById(`sidebar-${name}`)
  sidebar.style.height = `${(window.innerWidth / 2) - 50}px`
}

function sizePortList () {
  const sidebarPorts = document.getElementById('sidebar-ports')
  const portList = document.getElementById('port-list')

  const height = sidebarPorts.clientHeight - 125
  portList.style.height = `${height}px`
}

function handleResize (e) {
  sidebars.forEach(sidebar => sizeSidebar(sidebar))
  sizePortList()
}

export {
  init,
  toggleSidebar,
  handleResize
}