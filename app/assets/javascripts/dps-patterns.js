(() => {
  function setupHelpFocus() {
    const help = document.querySelector('.dps-context-help')
    if (!help) return

    help.addEventListener('toggle', () => {
      if (help.open) help.querySelector('h2').focus({ preventScroll: true })
    })
  }

  function setupStructurePreview(form) {
    const preview = form.querySelector('[data-structure-preview]')
    if (!preview) return

    const levelSelects = form.querySelectorAll('[data-level-select]')
    const addLevel = form.querySelector('[data-add-level]')

    function renderPreview() {
      let previousIndex = 0
      const labels = ['Wing']
      for (const select of levelSelects) {
        // The options are ordered Spurs, Landings, Cells. Each type can appear once.
        Array.from(select.options).forEach((option, index) => {
          option.disabled = index > 0 && index <= previousIndex
        })
        if (select.selectedIndex <= previousIndex) select.value = ''
        if (!select.value) continue
        previousIndex = select.selectedIndex
        labels.push(select.value)
      }

      if (addLevel) addLevel.hidden = labels.at(-1) === 'Cells'
      if (preview.hasAttribute('data-inline-preview')) {
        preview.textContent = labels.join(' → ')
        return
      }

      preview.replaceChildren(...labels.map(label => {
        const item = document.createElement('li')
        item.textContent = label
        return item
      }))
    }
    levelSelects.forEach(select => select.addEventListener('change', renderPreview))
    renderPreview()
  }

  function setupNameCounter(form) {
    const name = form.querySelector('#name')
    const counter = form.querySelector('[data-name-count]')
    if (!name || !counter) return

    function renderCount() {
      const remaining = 30 - name.value.length
      const units = Math.abs(remaining) === 1 ? 'character' : 'characters'
      counter.textContent = remaining < 0
        ? 'You have ' + Math.abs(remaining) + ' ' + units + ' too many'
        : 'You have ' + remaining + ' ' + units + ' remaining'
    }
    name.addEventListener('input', renderCount)
    renderCount()
  }

  setupHelpFocus()
  const form = document.querySelector('[data-wing-form]')
  if (!form) return
  setupStructurePreview(form)
  setupNameCounter(form)
})()
