# jsreport-fop-xsl-pdf


jsreport recipe which is rendering pdf using [apache fop](https://xmlgraphics.apache.org/fop/) with xsl template



## Installation
> npm install jsreport-fop-xsl-pdf

## Usage
To use `recipe` in for template rendering set `template.recipe=fop-xsl-pdf` in the rendering request.

```js
{
  template: { content: '...', recipe: 'fop-xsl-pdf', enginne: '...' },
   data: {
        data: '....',
        outName: '...',
        outType: '...'}
}
```
Set xsl template in content or create it as template and use by name/id
Set xml data in the data field
Optional:
Set FileName in outName and FileType in outType(FileType - is a available type for Fop which are used) 

It is possible to use fop.xconf. It should be added in the root directory.
