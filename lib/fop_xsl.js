var childProcess = require('child_process')
var uuid = require('uuid').v4
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
      reporter.logger.info('Rendering fop start.')

      var xslFilePath = join(reporter.options.tempAutoCleanupDirectory, uuid() + '.xsl')
      var xmlFilePath = xslFilePath.replace('.xsl', '.xml')
      var outType = request.data.outType ? request.data.outType : 'pdf'
      var outFilePath = xslFilePath.replace('.xsl', '.' + outType)
      var outName = request.data.outName ? request.data.outName : 'report'
      return fs.writeFileAsync(xslFilePath, response.content).then(function () {
        return fs.writeFileAsync(xslFilePath, response.content)
      }).then(function () {
        return fs.writeFileAsync(xmlFilePath, request.data.data).then(function () {
          return fs.writeFileAsync(xmlFilePath, request.data.data)
        }).then(function () {
          reporter.logger.info('Rastering pdf child process start.')

          var cmds = [
            'fop',
            '-xml',
            xmlFilePath,
            '-xsl',
            xslFilePath,
            '-' + outType,
            outFilePath
          ]
          if (fs.existsSync(reporter.options.rootDirectory + 'fop.xconf')) {
            cmds.push('-c')
            cmds.push(reporter.options.rootDirectory + 'fop.xconf')
          }
          return new Promise(function (resolve, reject) {
            childProcess.exec(cmds.join(' '), {
              maxBuffer: definition.options.maxOutputSize

            }, function (error, stdout, stderr) {
              reporter.logger.info('Rastering pdf child process end.', request)

              if (error !== null) {
                reporter.logger.error('exec error: ' + error)
                error.weak = true
                return reject(error)
              }

              if (!fs.existsSync(outFilePath)) {
                return reject(new Error(stderr + stdout))
              }

              if (stdout) {
                reporter.logger.debug('fop log (stdout): ' + trimMessage(stdout, definition.options.maxLogEntrySize), request)
              }

              if (stderr) {
                reporter.logger.debug('fop log (stderr): ' + trimMessage(stderr, definition.options.maxLogEntrySize), request)
              }

              response.meta.contentType = 'application/' + outType
              response.meta.fileExtension = outType
              filename = encodeURIComponent(outName+'.'+outType)
              response.meta.headers['Content-Disposition'] = ('inline; filename*=UTF-8\'\''+filename)
              return fs.readFile(outFilePath, function (err, buf) {
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
