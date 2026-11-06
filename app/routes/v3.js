// Change the version here when copying these routes and views.
const v = '/v3/'
const vGet = v.slice(1)
const multiplePagesSignIn = v + 'sign-in-multiple-pages'
const termsParts = [
  {
    title: 'Before you start using HMPPS Digital Services',
    sections: ['introduction', 'what-are-hmpps-digital-services', 'who-we-are']
  },
  {
    title: 'Accessing information responsibly',
    sections: ['accessing-information']
  },
  {
    title: 'Keeping information and your account secure',
    sections: ['keeping-information-secure', 'protecting-your-account', 'reporting-security-breaches']
  },
  {
    title: 'Using HMPPS Digital Services professionally',
    sections: ['keeping-records-accurate', 'monitoring-your-activity', 'misuse']
  },
  {
    title: 'Your information and accepting the terms',
    sections: ['your-personal-details', 'changes-and-acceptance']
  }
]

const termsPartUrl = part => v + 'terms-multiple-pages' + (part === 1 ? '' : '-' + part)
const withHtmlAlias = path => [path, path + '.html']

function renderTermsPart(res, part, termsError = false) {
  res.render(vGet + 'terms-multiple-pages', {
    ...termsParts[part - 1],
    part,
    totalParts: termsParts.length,
    backUrl: part === 1 ? multiplePagesSignIn : termsPartUrl(part - 1),
    nextUrl: part < termsParts.length ? termsPartUrl(part + 1) : null,
    termsError
  })
}

function acceptTerms(renderError) {
  return (req, res) => {
    const accepted = [req.body['terms-accepted']].flat().includes('accepted')

    if (!accepted) {
      return renderError(res)
    }

    res.redirect(v + 'select-service')
  }
}

module.exports = router => {
  // Shared footer and navigation destinations for this version's templates.
  router.use(v, (req, res, next) => {
    res.locals.termsUrl = v + 'terms-and-conditions'
    res.locals.routes = { dpsHome: v + 'dps-home' }

    next()
  })

  router.post([v + 'sign-in-with-static-contents', v + 'sign-in-with-static-contents.html'], (req, res) => {
    res.redirect(v + 'terms-with-static-contents')
  })

  router.post([v + 'sign-in-with-passive-acceptance', v + 'sign-in-with-passive-acceptance.html'], (req, res) => {
    res.redirect(v + 'terms-with-passive-acceptance')
  })

  router.post(withHtmlAlias(multiplePagesSignIn), (req, res) => {
    res.redirect(termsPartUrl(1))
  })

  termsParts.forEach((_, index) => {
    const part = index + 1
    router.get(withHtmlAlias(termsPartUrl(part)), (req, res) => renderTermsPart(res, part))
  })

  router.post(
    withHtmlAlias(termsPartUrl(termsParts.length)),
    acceptTerms(res => renderTermsPart(res, termsParts.length, true))
  )

  router.post([v + 'terms-with-passive-acceptance', v + 'terms-with-passive-acceptance.html'], (req, res) => {
    res.redirect(v + 'select-service')
  })

  router.post(
    withHtmlAlias(v + 'terms-with-static-contents'),
    acceptTerms(res => res.render(vGet + 'terms-with-static-contents', { termsError: true }))
  )
}
