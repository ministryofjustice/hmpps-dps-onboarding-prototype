window.GOVUKPrototypeKit.documentReady(() => {
  const contents = document.querySelector('[data-terms-contents]')
  if (!contents) return

  const links = Array.from(contents.querySelectorAll('.terms-contents__link'))
  const sections = links.map(link => document.getElementById(link.hash.slice(1)))
  let scheduled = false

  const update = () => {
    scheduled = false
    // Keep every link reachable without giving the sidebar its own scrollbar.
    contents.classList.toggle('terms-contents--sticky', contents.offsetHeight + 40 <= window.innerHeight)

    let current = 0
    sections.forEach((section, index) => {
      if (section && section.getBoundingClientRect().top <= 100) current = index
    })

    links.forEach((link, index) => {
      if (index === current) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
    })
  }

  const scheduleUpdate = () => {
    if (scheduled) return
    scheduled = true
    window.requestAnimationFrame(update)
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true })
  window.addEventListener('resize', scheduleUpdate)
  if ('ResizeObserver' in window) new ResizeObserver(scheduleUpdate).observe(contents)
  update()
})
