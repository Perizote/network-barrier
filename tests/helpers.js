const readFileAsync = file => new Promise(resolve => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.readAsText(file)
})

export { readFileAsync }