// Change the version here when copying this route file and its views.
const version = 'v4'
const v = '/' + version + '/'
const vGet = version + '/'

const walkthroughs = require('../views/' + vGet + 'includes/walkthroughs.json')
const conciseGuides = require('../views/' + vGet + 'includes/concise-guides.json')

const locations = v + 'locations'
const help = locations + '/help'
const practice = help + '/practice'
const wing = locations + '/wing'
const practiceWing = practice + '/wing'
const practiceCells = practice + '/cells'
const urls = {
  home: v + 'dps-home',
  locations,
  residential: locations + '/residential',
  help,
  practice,
  wing
}
const variants = ['no-help', 'walkthrough', 'concise', 'contextual']

const versionData = req => (req.session.data[version] ??= {})
const getWing = req => (versionData(req).wing ??= newWing())
const getPractice = req => (versionData(req).practice ??= {})

module.exports = router => {
  router.use(v, (req, res, next) => {
    const data = versionData(req)
    if (req.query.variant !== undefined) {
      data.variant = variants.includes(req.query.variant) ? req.query.variant : 'no-help'
    }
    const variant = data.variant ?? 'no-help'
    res.locals.variant = variant
    res.locals.showProductHelp = variant === 'walkthrough' || variant === 'concise'
    res.locals.productHelpText = 'Help using Locations'
    res.locals.urls = urls
    next()
  })

  router.get(urls.home, (req, res) => res.render(vGet + 'dps-home'))
  router.get(locations, (req, res) => res.render(vGet + 'locations/index'))
  router.get(urls.residential, (req, res) => res.render(vGet + 'locations/residential'))

  // Product help and guidance
  router.use(help, (req, res, next) => {
    if (!res.locals.showProductHelp) return res.redirect(locations)
    res.locals.helpNav = helpNav
    res.locals.guidanceImages = '/public/images/locations/walkthrough'
    next()
  })

  router.get(help, (req, res) => res.render(vGet + 'help/overview', { activeGuide: 'overview' }))
  router.get(help + '/roles', (req, res) => res.render(vGet + 'help/roles', {
    activeGuide: 'roles',
    guidePageTitle: roles.text
  }))
  router.get(help + '/contact', (req, res) => res.render(vGet + 'help/contact', {
    activeGuide: 'contact',
    guidePageTitle: contact.text
  }))

  router.get([help + '/:guide', help + '/:guide/:section'], (req, res, next) => {
    const guide = req.params.guide.toLowerCase()
    if (!Object.hasOwn(walkthroughs, guide)) return next()

    const { title, sections } = walkthroughs[guide]
    const guidePath = help + '/' + guide
    const section = req.params.section
    const index = Number(section) - 1
    if (section && (!/^[1-9]\d*$/.test(section) || !sections[index])) return next()

    const practiceUrl = guide === 'wing' ? practiceWing : practiceCells
    if (res.locals.variant === 'concise') {
      if (section) return res.redirect(guidePath)
      return res.render(vGet + 'help/concise', {
        activeGuide: guide,
        guidePageTitle: title,
        guide: conciseGuides[guide],
        practiceUrl
      })
    }

    if (!section) return res.redirect(guidePath + '/1')
    const steps = sections.map((step, i) => ({ ...step, href: guidePath + '/' + (i + 1) }))
    res.render(vGet + 'help/walkthrough', {
      activeGuide: guide,
      guideTitle: title,
      guidePageTitle: steps[index].title,
      steps,
      step: steps[index],
      section: Number(section),
      previous: steps[index - 1],
      next: steps[index + 1],
      practiceUrl
    })
  })

  // Create a wing
  router.get(wing + '/details', (req, res) => showWingForm(req, res, 'details'))
  router.get(wing + '/structure', requireProgress('structure'), (req, res) => showWingForm(req, res, 'structure'))
  router.get(wing + '/review', requireProgress('review'), (req, res) => showWingForm(req, res, 'review'))
  router.get(wing + '/cell-details', requireProgress('cell-details'), (req, res) => showWingForm(req, res, 'cell-details'))
  router.get(wing + '/cell-numbers', requireProgress('cell-numbers'), (req, res) => showWingForm(req, res, 'cell-numbers'))
  router.get(wing + '/door-numbers', requireProgress('door-numbers'), (req, res) => showWingForm(req, res, 'door-numbers'))
  router.get(wing + '/capacities', requireProgress('capacities'), (req, res) => showWingForm(req, res, 'capacities'))
  router.get(wing + '/complete', requireProgress('complete'), (req, res) => showWingForm(req, res, 'complete'))

  router.post(wing + '/start', (req, res) => {
    versionData(req).wing = newWing()
    res.redirect(wing + '/details')
  })

  router.post(wing + '/details', (req, res) => {
    Object.assign(getWing(req), { fields: readWingDetails(req.body), detailsSaved: true })
    res.redirect(wing + (req.query.change === '1' && getWing(req).structureSaved ? '/review' : '/structure'))
  })

  router.post(wing + '/structure', requireProgress('structure'), (req, res) => {
    const levels = readWingStructure(req.body)
    if (!levels.length) levels.push('')
    const action = text(req.body._action)

    if (action === 'remove-3' || action === 'remove-4') {
      levels.splice(Number(action.at(-1)) - 2, 1)
      return showWingForm(req, res, 'structure', levels)
    }
    if (action === 'add-level' && levels.length < levelTypes.length) {
      levels.push('')
      return showWingForm(req, res, 'structure', levels)
    }

    Object.assign(getWing(req), { levels, structureSaved: true })
    res.redirect(wing + '/review')
  })

  router.post(wing + '/review', requireProgress('review'), (req, res) => {
    getWing(req).wingCreated = true
    res.redirect(wing + '/cell-details')
  })

  router.post(wing + '/cell-details', requireProgress('cell-details'), (req, res) => {
    const count = text(req.body._count)
    const cellCount = exampleNumber(count, 8, 100)
    const data = getWing(req)
    if (data.cells.length !== cellCount) {
      data.cells = Array.from({ length: cellCount }, (_, index) => data.cells[index] || {})
      data.numbersSaved = data.doorsSaved = data.complete = false
    }
    Object.assign(data, { count, accommodation: text(req.body._accommodation), cellDetailsSaved: true })
    res.redirect(wing + '/cell-numbers')
  })

  router.post(wing + '/cell-numbers', requireProgress('cell-numbers'), (req, res) => {
    const data = getWing(req)
    const start = text(req.body._start)

    data.start = start
    if (req.body._action === 'apply') {
      const firstNumber = exampleNumber(start, 1, 1000 - data.cells.length)
      data.cells = data.cells.map((cell, index) => ({ ...cell, number: cellNumber(firstNumber, index) }))
      return res.redirect(wing + '/cell-numbers')
    }

    const numbers = textList(req.body._number)
    data.cells = data.cells.map((cell, index) => {
      const entered = numbers[index] || ''
      const number = /^\d{1,3}$/.test(entered) ? entered.padStart(3, '0') : entered
      return { ...cell, number }
    })
    data.numbersSaved = true
    res.redirect(wing + '/door-numbers')
  })

  router.post(wing + '/door-numbers', requireProgress('door-numbers'), (req, res) => {
    const data = getWing(req)
    const doors = textList(req.body._door)
    data.cells = data.cells.map((cell, index) => ({ ...cell, door: doors[index] || '' }))
    data.doorsSaved = true
    res.redirect(wing + '/capacities')
  })

  router.post(wing + '/capacities', requireProgress('capacities'), (req, res) => {
    const data = getWing(req)
    const cells = readCapacities(req.body, data.cells)
    const bulk = Object.fromEntries(capacityFields.map(({ name }) => [name, text(req.body['_all_' + name])]))
    const field = capacityFields.find(({ name }) => name === req.body._action)
    if (field) {
      data.cells = cells.map(cell => ({ ...cell, [field.name]: bulk[field.name] || '1' }))
      data.bulk = bulk
      return res.redirect(wing + '/capacities')
    }

    Object.assign(data, { cells, bulk, complete: true })
    res.redirect(wing + '/complete')
  })

  router.post(wing + '/cancel', (req, res) => {
    delete versionData(req).wing
    res.redirect(urls.residential)
  })

  // Example tasks
  router.get(practice, (req, res) => res.render(vGet + 'help/practice-index', {
    activeGuide: 'practice',
    guidePageTitle: 'Try an example task'
  }))

  router.get(practiceWing, (req, res) => showPractice(req, res, 'wing', 'intro'))
  router.post(practiceWing, (req, res) => {
    getPractice(req).wing = newPractice()
    res.redirect(practiceWing + '/details')
  })

  router.get(practiceWing + '/details', (req, res) => showPractice(req, res, 'wing', 'details', practiceWing))
  router.post(practiceWing + '/details', (req, res) => {
    practiceData(req, 'wing').fields = readWingDetails(req.body)
    res.redirect(practiceWing + '/structure')
  })

  router.get(practiceWing + '/structure', (req, res) => showPractice(req, res, 'wing', 'structure', practiceWing + '/details'))
  router.post(practiceWing + '/structure', (req, res) => {
    practiceData(req, 'wing').levels = readWingStructure(req.body)
    res.redirect(practiceWing + '/review')
  })

  router.get(practiceWing + '/review', (req, res) => showPractice(req, res, 'wing', 'review', practiceWing + '/structure'))
  router.post(practiceWing + '/review', (req, res) => res.redirect(practiceWing + '/complete'))
  router.get(practiceWing + '/complete', (req, res) => showPractice(req, res, 'wing', 'complete'))

  router.get(practiceCells, (req, res) => showPractice(req, res, 'cells', 'intro'))
  router.post(practiceCells, (req, res) => {
    getPractice(req).cells = newPractice()
    res.redirect(practiceCells + '/count')
  })

  router.get(practiceCells + '/count', (req, res) => showPractice(req, res, 'cells', 'count', practiceCells))
  router.post(practiceCells + '/count', (req, res) => {
    const data = practiceData(req, 'cells')
    data.count = text(req.body._count)
    const count = exampleNumber(data.count, 1, 20)
    if (count !== data.cells.length) {
      data.cells = exampleCells(count).map((cell, index) => data.cells[index] || cell)
    }
    res.redirect(practiceCells + '/capacities')
  })

  router.get(practiceCells + '/capacities', (req, res) => showPractice(req, res, 'cells', 'capacities', practiceCells + '/count'))
  router.post(practiceCells + '/capacities', (req, res) => {
    const data = practiceData(req, 'cells')
    data.cells = readCapacities(req.body, data.cells)
    res.redirect(practiceCells + '/review')
  })

  router.get(practiceCells + '/review', (req, res) => showPractice(req, res, 'cells', 'review', practiceCells + '/capacities'))
  router.post(practiceCells + '/review', (req, res) => res.redirect(practiceCells + '/complete'))
  router.get(practiceCells + '/complete', (req, res) => showPractice(req, res, 'cells', 'complete'))
}

function showWingForm(req, res, step, editedLevels) {
  const index = wingSteps.findIndex(({ path }) => path === step)
  const { heading, forCells } = wingSteps[index]
  if (step === 'complete') return res.render(vGet + 'wing/complete', { heading })

  const data = getWing(req)
  const levels = step === 'review' || forCells ? exampleLevels(data.levels) : editedLevels ?? data.levels
  const changing = req.query.change === '1' && ['details', 'structure'].includes(step)
  const previous = index === 0 ? urls.residential : wing + '/' + wingSteps[index - 1].path
  const values = {
    ...data,
    step,
    heading,
    levels,
    levelTypes,
    capacityFields,
    help: contextualHelp[step],
    back: changing ? wing + '/review' : previous,
    action: wing + '/' + step + (changing ? '?change=1' : ''),
    caption: 'Create new wing'
  }

  if (step === 'review') {
    values.fields = { code: data.fields.code || 'ZZ', name: data.fields.name || 'AAA' }
  }

  if (forCells) {
    const parentLevels = levels.slice(0, -1)
    const parentType = { Spurs: 'spur', Landings: 'landing' }[parentLevels.at(-1)] || 'wing'
    values.prefix = [data.fields.code || 'ZZ', ...parentLevels.map(() => 'AAA')].join('-')
    values.caption = 'Create cells on ' + parentType + ' ' + values.prefix
  }

  if (step === 'cell-details') {
    values.accommodations = accommodation.map(item => ({ ...item, checked: item.value === data.accommodation }))
  }

  if (step === 'cell-numbers' && levels.length < 3) {
    values.help = {
      ...values.help,
      paragraphs: [values.help.paragraphs[0], 'Check the sequence and location code before continuing.']
    }
  }

  if (step === 'door-numbers' || step === 'capacities') {
    const start = exampleNumber(data.start, 1, 1000 - data.cells.length)
    values.cells = data.cells.map((cell, index) => ({
      ...cell,
      number: cell.number || cellNumber(start, index)
    }))
  }

  res.render(vGet + 'wing/form', values)
}

const requireProgress = path => (req, res, next) => {
  const { requires } = wingSteps.find(step => step.path === path)
  const data = getWing(req)
  if (!requires || data[requires]) return next()
  if (!data.detailsSaved) return res.redirect(wing + '/details')
  if (!data.structureSaved) return res.redirect(wing + '/structure')
  const firstUnavailable = wingSteps.find(({ requires }) => requires && !data[requires])
  res.redirect(wing + '/' + firstUnavailable.path)
}

function exampleCells(count) {
  return Array.from({ length: count }, (_, index) => ({
    number: cellNumber(31, index),
    door: String(index + 31),
    baseline: '',
    working: '',
    maximum: ''
  }))
}

function newPractice() {
  return { fields: { code: '', name: '' }, levels: ['', '', ''], count: '', cells: exampleCells(1) }
}

function practiceData(req, task) {
  return (getPractice(req)[task] ??= newPractice())
}

function showPractice(req, res, task, step, back) {
  const values = practiceData(req, task)
  const isWing = task === 'wing'
  const start = isWing ? practiceWing : practiceCells
  const review = step === 'review'

  res.render(vGet + 'help/practice', {
    ...values,
    title: isWing ? 'Practise setting up a wing' : 'Practise adding cells',
    task,
    step,
    capacityFields,
    levelTypes,
    fields: review ? { code: values.fields.code || 'B', name: values.fields.name || 'Example wing' } : values.fields,
    levels: review ? exampleLevels(values.levels) : values.levels,
    cells: review ? values.cells.map(cell => ({
      ...cell,
      baseline: cell.baseline || '1',
      working: cell.working || '1',
      maximum: cell.maximum || '1'
    })) : values.cells,
    activeGuide: 'practice',
    action: step === 'intro' ? start : start + '/' + step,
    restart: start,
    back,
    guide: help + (isWing ? '/wing' : '/add-cells')
  })
}

const accommodation = [
  { value: 'normal', text: 'Normal accommodation' },
  { value: 'separation', text: 'Care and separation' },
  { value: 'healthcare', text: 'Healthcare inpatients' }
]

const capacityFields = [
  { name: 'baseline', label: 'Baseline CNA', fullLabel: 'Baseline certified normal accommodation (CNA)' },
  { name: 'working', label: 'Working capacity', fullLabel: 'Working capacity' },
  { name: 'maximum', label: 'Maximum capacity', fullLabel: 'Maximum capacity' }
]

const levelTypes = ['Spurs', 'Landings', 'Cells']
const text = value => typeof value === 'string' ? value.trim() : ''

function textList(value) {
  if (Array.isArray(value)) return value.map(text)
  return typeof value === 'string' ? [text(value)] : []
}

function exampleNumber(value, fallback, maximum) {
  const number = Number(value)
  return /^\d+$/.test(value) && number >= 1 && number <= maximum ? number : fallback
}

function readWingDetails(body) {
  return { code: text(body._code).toUpperCase(), name: text(body._name) }
}

function readWingStructure(body) {
  return [body._level2, body._level3, body._level4]
    .filter(value => typeof value === 'string')
    .map(value => levelTypes.includes(value) ? value : '')
}

function exampleLevels(levels) {
  const result = []
  for (const [index, entered] of levels.entries()) {
    const level = entered || (index === levels.length - 1 ? 'Cells' : levelTypes[index])
    const nextChoice = levels.slice(index + 1).find(Boolean)
    const order = levelTypes.indexOf(level)

    // Fill blanks with example levels that fit before the next user selection.
    if (!entered && nextChoice && order >= levelTypes.indexOf(nextChoice)) continue
    if (order > levelTypes.indexOf(result.at(-1))) result.push(level)
    if (level === 'Cells') break
  }
  if (!result.includes('Cells')) result.push('Cells')
  return result
}

function readCapacities(body, cells) {
  const columns = capacityFields.map(({ name }) => ({ name, values: textList(body['_' + name]) }))
  return cells.map((cell, index) => {
    const updatedCell = { ...cell }
    for (const { name, values } of columns) {
      updatedCell[name] = values[index] ?? ''
    }
    return updatedCell
  })
}

const wingSteps = [
  { path: 'details', heading: 'Enter wing details' },
  { path: 'structure', heading: 'Set wing structure', requires: 'detailsSaved' },
  { path: 'review', heading: 'Check and confirm the wing details', requires: 'structureSaved' },
  { path: 'cell-details', heading: 'Enter cell details', requires: 'wingCreated', forCells: true },
  { path: 'cell-numbers', heading: 'Enter cell numbers', requires: 'cellDetailsSaved', forCells: true },
  { path: 'door-numbers', heading: 'Enter cell door numbers', requires: 'numbersSaved', forCells: true },
  { path: 'capacities', heading: 'Enter cell capacities and type', requires: 'doorsSaved', forCells: true },
  { path: 'complete', heading: 'End of prototype', requires: 'complete' }
]

const contextualHelp = {
  structure: {
    title: 'Choose the wing structure',
    paragraphs: [
      'Choose the levels that match the physical wing. A spur is a section of a wing; a landing is a floor or corridor; cells are the individual rooms.',
      'Check the structure preview before continuing.'
    ]
  },
  'cell-details': {
    title: 'Choose the accommodation type',
    paragraphs: [
      'Normal accommodation: cells used for ordinary residential accommodation.',
      'Care and separation: cells in a care and separation unit.',
      'Healthcare inpatients: accommodation for people admitted to inpatient healthcare.',
      'The type applies to all cells created in this group.'
    ]
  },
  'cell-numbers': {
    title: 'Set the cell numbers',
    paragraphs: [
      'Enter the starting number and select Apply to generate the cell numbers.',
      'Each number includes the wing, spur and landing codes. Check the sequence before continuing.'
    ]
  },
  capacities: {
    title: 'Set capacities and cell types',
    paragraphs: [
      'Baseline CNA: how many people can live in a cell without overcrowding.',
      'Working capacity: how many can live there now, based on the available beds, furniture and sanitation.',
      'Maximum capacity: the maximum number who could potentially live there.',
      'Use Apply to all only when a value is appropriate for every cell. Check each row before continuing.'
    ]
  }
}

function newWing() {
  return {
    fields: { code: '', name: '' },
    levels: [''],
    count: '',
    accommodation: '',
    start: '',
    cells: []
  }
}

function cellNumber(start, index) {
  return String(start + index).padStart(3, '0')
}

const overview = { text: 'Locations overview', href: help, key: 'overview' }
const roles = { text: 'What each Locations role can do', href: help + '/roles', key: 'roles' }
const contact = { text: 'Contact us', href: help + '/contact', key: 'contact' }
const helpNav = [
  { items: [overview, roles] },
  { title: 'Residential locations', items: [
    { text: walkthroughs.wing.title, href: help + '/wing', key: 'wing' },
    { text: walkthroughs['add-cells'].title, href: help + '/add-cells', key: 'add-cells' },
    { text: 'Manage existing locations' },
    { text: 'Cell certificates and approval' }
  ] },
  { title: 'Non-residential locations', items: [{ text: 'Manage non-residential locations' }] },
  { items: [{ text: 'Try an example task', href: urls.practice, key: 'practice' }, contact] }
]
