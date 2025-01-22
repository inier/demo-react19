// https://github.com/moroshko/react-scanner
// SUPPORTED TYPESCRIPT VERSIONS: >=4.7.4 <5.6.0

module.exports = {
    crawlFrom: './src',
    includeSubComponents: true,
    importedFrom: 'basis',
    processors: [['count-components-and-props', { outputTo: './dist/components-report.json' }]],
};
