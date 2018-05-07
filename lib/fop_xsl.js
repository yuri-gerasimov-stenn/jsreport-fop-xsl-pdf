var childProcess = require('child_process')
var uuid = require('uuid').v1
var join = require('path').join
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs'))

function trimMessage (msg, maxLogEntrySize) {
  if (msg.length > maxLogEntrySize) {
    return msg.substring(0, maxLogEntrySize) + '...'
  }

  return msg
}

module.exports = function (reporter, definition) {
  definition.options = definition.options || {}
  definition.options.maxOutputSize = (definition.options.maxOutputSize != null) ? definition.options.maxOutputSize : (500 * 1024)
  definition.options.maxLogEntrySize = (definition.options.maxLogEntrySize != null) ? definition.options.maxLogEntrySize : 1000

  reporter.extensionsManager.recipes.push({
    name: 'fop-xsl-pdf',
    execute: function (request, response) {
      request.logger.info('Rendering fop start.')

      var xslFilePath = join(reporter.options.tempDirectory, uuid() + '.xsl')

      var xmlFilePath = xslFilePath.replace('.xsl', '.xml')
      var pdfFilePath = xslFilePath.replace('.xsl', '.pdf')
      return fs.writeFileAsync(xslFilePath, response.content).then(function () {
        return fs.writeFileAsync(xslFilePath, response.content)
      }).then(function () {
        return fs.writeFileAsync(xmlFilePath, request.data.data).then(function () {
          return fs.writeFileAsync(xmlFilePath, request.data.data)
        }).then(function () {
          request.logger.info('Rastering pdf child process start.')

          var cmds = [
            'fop',
            '-xml',
            xmlFilePath,
            '-xsl',
            xslFilePath,
            '-pdf',
            pdfFilePath,
          ]
          if (fs.existsSync(reporter.options.rootDirectory+"fop.xconf")){
            cmds.push('-c')
            cmds.push(reporter.options.rootDirectory+"fop.xconf")
          }
          return new Promise(function (resolve, reject) {
            childProcess.exec(cmds.join(" "), {
              maxBuffer: definition.options.maxOutputSize

            }, function (error, stdout, stderr) {
              request.logger.info('Rastering pdf child process end.')

              if (error !== null) {
                request.logger.error('exec error: ' + error)
                error.weak = true
                return reject(error)
              }

              if (!fs.existsSync(pdfFilePath)) {
                return reject(stderr + stdout)
              }

              if (stdout) {
                request.logger.debug('fop log (stdout): ' + trimMessage(stdout, definition.options.maxLogEntrySize))
              }

              if (stderr) {
                request.logger.debug('fop log (stderr): ' + trimMessage(stderr, definition.options.maxLogEntrySize))
              }

              response.headers['Content-Type'] = 'application/pdf'
              response.headers['File-Extension'] = 'pdf'
              response.headers['Content-Disposition'] = 'inline; filename="report.pdf"'

              return fs.readFile(pdfFilePath, function (err, buf) {
                if (err) {
                  return reject(err)
                }

                response.content = buf
                resolve(response)
              })
            })
          })
        })
      })
    }
  })
}
