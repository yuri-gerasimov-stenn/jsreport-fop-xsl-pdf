require('should')
var fs = require('fs')
var path = require('path')

var Reporter = require('jsreport-core').Reporter

describe('fop pdf', function () {
  var reporter

  beforeEach(function () {
    reporter = new Reporter().use(require('../')())

    return reporter.init()
  })

  it('should not fail when rendering', function () {
    this.timeout(10000);
    var request = {
      template: { content: fs.readFileSync(path.join(__dirname, '/test.xsl')),
        recipe: 'fop-xsl-pdf',
        engine: 'none' },
      data:fs.readFileSync(path.join(__dirname, '/test.json'))

    }

    return reporter.render(request, {}).then(function (response) {
      response.content.toString().should.containEql('%PDF')
    })
  })
})
