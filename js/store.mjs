let data = {}

const store = {
  getState: () => data,
  setState: updater => {
    let update
    if (typeof updater === 'function') {
      update = updater(data)
    } else {
      update = updater
    }
    Object.keys(update).forEach(k => {
      data[k] = update[k]
    })
  }
}

export {
  store
}
