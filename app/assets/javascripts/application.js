//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

window.GOVUKPrototypeKit.documentReady(() => {
  document.addEventListener('click', event => {
    const link = event.target.closest('a')
    if (link && (link.getAttribute('href') === '#' || link.dataset.qa === 'cdps-header-caseload')) {
      event.preventDefault()
    }
  })

  document.querySelectorAll('form[data-prototype-inert]').forEach(form => {
    form.addEventListener('submit', event => event.preventDefault())
  })
})
