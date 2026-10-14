// Change the version here when copying these routes and views.
const v = '/v2/'
const vGet = v.slice(1)

module.exports = router => {
  // Shared footer and navigation destinations for this version's templates.
  router.use(v, (req, res, next) => {
    res.locals.termsUrl = v + 'terms-and-conditions'
    res.locals.routes = { dpsHome: v + 'dps-home' }

    next()
  })

  router.get([v + 'terms-multiple-pages', v + 'terms-multiple-pages.html'], (req, res) => {
    res.render(vGet + 'terms-multiple-pages', {
      routes: {
        ...res.locals.routes,
        back: v + 'sign-in-multiple-pages',
        next: v + 'terms-multiple-pages-2'
      }
    })
  })

  router.get([v + 'terms-multiple-pages-2', v + 'terms-multiple-pages-2.html'], (req, res) => {
    res.render(vGet + 'terms-multiple-pages-2', {
      routes: {
        ...res.locals.routes,
        back: v + 'terms-multiple-pages',
        next: v + 'terms-multiple-pages-3'
      }
    })
  })

  router.get([v + 'terms-multiple-pages-3', v + 'terms-multiple-pages-3.html'], (req, res) => {
    res.render(vGet + 'terms-multiple-pages-3', {
      routes: {
        ...res.locals.routes,
        back: v + 'terms-multiple-pages-2',
        next: v + 'terms-multiple-pages-4'
      }
    })
  })

  router.get([v + 'terms-multiple-pages-4', v + 'terms-multiple-pages-4.html'], (req, res) => {
    res.render(vGet + 'terms-multiple-pages-4', {
      routes: {
        ...res.locals.routes,
        back: v + 'terms-multiple-pages-3',
        next: v + 'terms-multiple-pages-5'
      }
    })
  })

  router.get([v + 'terms-multiple-pages-5', v + 'terms-multiple-pages-5.html'], (req, res) => {
    res.render(vGet + 'terms-multiple-pages-5', {
      routes: {
        ...res.locals.routes,
        back: v + 'terms-multiple-pages-4'
      }
    })
  })

  router.post([v + 'sign-in', v + 'sign-in.html'], (req, res) => {
    res.redirect(v + 'terms')
  })

  router.post([v + 'sign-in-with-contents', v + 'sign-in-with-contents.html'], (req, res) => {
    res.redirect(v + 'terms-with-contents')
  })

  router.post([v + 'sign-in-with-static-contents', v + 'sign-in-with-static-contents.html'], (req, res) => {
    res.redirect(v + 'terms-with-static-contents')
  })

  router.post([v + 'sign-in-multiple-pages', v + 'sign-in-multiple-pages.html'], (req, res) => {
    res.redirect(v + 'terms-multiple-pages')
  })

  router.post([v + 'terms', v + 'terms.html'], (req, res) => {
    const accepted = [req.body['terms-accepted']].flat().includes('accepted')

    if (!accepted) {
      return res.render(vGet + 'terms', { termsError: true })
    }

    res.redirect(v + 'select-service')
  })

  router.post([v + 'terms-with-contents', v + 'terms-with-contents.html'], (req, res) => {
    const accepted = [req.body['terms-accepted']].flat().includes('accepted')

    if (!accepted) {
      return res.render(vGet + 'terms-with-contents', { termsError: true })
    }

    res.redirect(v + 'select-service')
  })

  router.post([v + 'terms-with-static-contents', v + 'terms-with-static-contents.html'], (req, res) => {
    const accepted = [req.body['terms-accepted']].flat().includes('accepted')

    if (!accepted) {
      return res.render(vGet + 'terms-with-static-contents', { termsError: true })
    }

    res.redirect(v + 'select-service')
  })

  router.post([v + 'terms-multiple-pages-5', v + 'terms-multiple-pages-5.html'], (req, res) => {
    const accepted = [req.body['terms-accepted']].flat().includes('accepted')

    if (!accepted) {
      return res.render(vGet + 'terms-multiple-pages-5', {
        termsError: true,
        routes: {
          ...res.locals.routes,
          back: v + 'terms-multiple-pages-4'
        }
      })
    }

    res.redirect(v + 'select-service')
  })
}
