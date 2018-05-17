module.exports = {
  'name': 'fop-xsl-pdf',
  'main': 'lib/fop_xsl.js',
  'hasPublicPart': false
}
module.exports = {
  'name': 'fop-xsl-pdf',
  'main': 'lib/fop_xsl.js',
  'optionsSchema': {
    extensions: {
      'fop-pdf': {
        type: 'object',
        properties: {
          maxOutputSize: { type: 'number' },
          maxLogEntrySize: { type: 'number' }
        }
      }
    }
  },
  'hasPublicPart': false
}

