// Change versions here
var v = '/v1/'
var vGet = 'v1/'

// Add any directory variables here

module.exports = router => {
  router.post(v + 'sign-in', (req, res) => {
    res.redirect(v + 'select-service')
  })
}
