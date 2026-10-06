// Change versions here
var v = '/v1/'
var vGet = 'v1/'

// Add any directory variables here

module.exports = router => {
  router.post(v + 'sign-in-multiple-pages', (req, res) => {
    res.redirect(v + 'terms-multiple-pages')
  })

  router.post(v + 'terms-multiple-pages', (req, res) => {
    if (req.body['terms-accepted'] !== 'accepted') {
      return res.render(vGet + 'terms-multiple-pages-4', { termsError: true })
    }

    res.redirect(v + 'select-service')
  })

  router.post(v + 'sign-in', (req, res) => {
    res.redirect(v + 'terms')
  })

  router.post(v + 'terms', (req, res) => {
    if (req.body['terms-accepted'] !== 'accepted') {
      return res.render(vGet + 'terms', { termsError: true })
    }

    res.redirect(v + 'select-service')
  })
}
