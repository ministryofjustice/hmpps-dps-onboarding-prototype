//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter

// Keep header and footer links within the prototype's current page.
const inertLinks = html => html.replace(/<a\b[^>]*>/g, tag =>
  tag.replace(/\shref="[^"]*"/g, ' href="#"')
    .replace(/\s+target="[^"]*"/g, '')
)

addFilter('inertLinks', inertLinks, { renderAsHtml: true })

// Header identity links return to the prototype home.
const prototypeHeaderLinks = html => inertLinks(html).replace(/<a\b[^>]*>/g, tag => {
  const classes = (tag.match(/\bclass="([^"]*)"/) || [])[1] || ''
  const identityClasses = [
    'govuk-header__homepage-link',
    'govuk-header__link--homepage',
    'govuk-header__link--service-name',
    'fallback-dps-header__title__organisation-name',
    'fallback-dps-header__title__service-name'
  ]

  return identityClasses.some(className => classes.split(/\s+/).includes(className))
    ? tag.replace(/\shref="[^"]*"/g, ' href="/"')
    : tag
})

addFilter('prototypeHeaderLinks', prototypeHeaderLinks, { renderAsHtml: true })

// Hide the account navigation on the signed-out package header.
addFilter('prototypeHmppsHeader', (html, signedIn) => {
  const header = signedIn ? html : html.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/g, '')
  return prototypeHeaderLinks(header)
}, { renderAsHtml: true })
