const rightpad = require('right-pad')

const formatOption = (e, i = '?') => {
  if (typeof e !== 'object') {
    return undefined
  }
  return `${rightpad(i.toString(), 10)} ${rightpad(e.id, 70)} ` + [e.name, e.email].filter(p => p).join(' / ')
}

const unFormatOption = (item) => {
  return item.substring(11, 82).trim()
}

module.exports = {
  formatOption,
  unFormatOption
}
