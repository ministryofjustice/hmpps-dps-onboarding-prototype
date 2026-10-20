// Change the version here when copying these routes and views.
const v = '/v3/'
const vGet = v.slice(1)

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

  router.post([v + 'terms-with-passive-acceptance', v + 'terms-with-passive-acceptance.html'], (req, res) => {
    res.redirect(v + 'select-service')
  })

  router.post([v + 'terms-with-static-contents', v + 'terms-with-static-contents.html'], (req, res) => {
    const accepted = [req.body['terms-accepted']].flat().includes('accepted')

    if (!accepted) {
      return res.render(vGet + 'terms-with-static-contents', { termsError: true })
    }

    res.redirect(v + 'select-service')
  })
}
