function nTimesSiblings(n, tagName) {
  return `<${tagName}></${tagName}>`.repeat(n)
}

document
  .querySelector('Triangle')
  .innerHTML = nTimesSiblings(100, 'Circle')
