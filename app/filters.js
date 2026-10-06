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

// Hide the account navigation on the signed-out package header.
addFilter('prototypeHmppsHeader', (html, signedIn) => {
  const header = signedIn ? html : html.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/g, '')
  return inertLinks(header)
}, { renderAsHtml: true })
