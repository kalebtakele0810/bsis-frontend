'use strict';

angular.module('bsis').factory('ReportsLayoutService', function(LogosService, $filter, gettextCatalog) {
  return {
    generatePdfPageHeader: function(orientation, headerTextLine1, headerTextLine2, headerTextLine3) {
      var image2LeftMargin = 450;
      if (orientation === 'landscape') {
        image2LeftMargin = 690;
      }
      var header = [{
        image: LogosService.getHeaderLogo1,
        height: 54,
        width: 105,
        margin: [30, 10, 0, 0] // [left, top, right, bottom]
      }];
      if (LogosService.getHeaderLogo2) {
        header.push({
          image: LogosService.getHeaderLogo2,
          height: 54,
          width: 105,
          margin: [image2LeftMargin, -54, 0, 0]
        });
      }
      header.push({text: headerTextLine1, fontSize: 11, bold: true, alignment: 'center', margin: [30, -35, 30, 0]});
      if (headerTextLine2) {
        header.push({text: headerTextLine2, fontSize: 9, alignment: 'center'});
      }
      if (headerTextLine3) {
        header.push({text: headerTextLine3, fontSize: 9, alignment: 'center'});
      }
      return header;
    },
    generatePdfPageFooter: function(recordsName, totalRecords, currentPage, pageCount, orientation) {
      // initialize variables for portrait orientation
      var image1LeftMargin = 150;
      var poweredByLeftMargin = 260;
      var image2LeftMargin = 350;

      if (orientation === 'landscape') {
        image1LeftMargin += 130;
        poweredByLeftMargin += 130;
        image2LeftMargin += 130;
      }

      var columns = [];
      if (recordsName) {
        columns.push({text: gettextCatalog.getString('Total {{recordsName}}: {{totalRecords}}', {recordsName: recordsName, totalRecords: totalRecords}), width: 'auto'});
      }
      columns.push({text: gettextCatalog.getString('Date generated: {{date}}', {date: $filter('bsisDateTime')(new Date())}), width: 'auto'});
      if (currentPage) {
        columns.push({text: gettextCatalog.getString('Page {{currentPage}} of {{pageCount}}', {currentPage: currentPage, pageCount: pageCount}), alignment: 'right'});
      }
      return [{
        image: LogosService.getFooterLogo1,
        width: 72,
        height: 38,
        margin: [image1LeftMargin, 0]
      }, {
        text: gettextCatalog.getString('Powered by'),
        margin: [poweredByLeftMargin, -20]
      }, {
        image: LogosService.getFooterLogo2,
        width: 74,
        height: 38,
        margin: [image2LeftMargin, -8]
      }, {
        columns: columns,
        columnGap: 10,
        margin: [30, 18]
      }];
    },

    pdfTableHeaderStyle: {fontSize: 8, bold: true, margin: [-2, 0, 0, 0]},
    pdfTableBodyBoldStyle: {fontSize: 8, bold: true},
    pdfTableBodyGreyBoldStyle: {fillColor: 'lightgrey', fontSize: 8, bold: true},
    pdfDefaultStyle: {fontSize: 8, margin: [-2, 0, 0, 0]},
    pdfPortraitMaxGridWidth: 450,
    pdfLandscapeMaxGridWidth: 650,

    paginatePdf: function(rowsPerPage, docDefinition) {

      // set page margins
      docDefinition.pageMargins = [30, 70, 30, 75];

      // display no data message if the table only contains the header
      if (docDefinition.content[0].table.body.length === 1) {
        docDefinition.content.splice(0, 0, {text: gettextCatalog.getString('No data for date range selected'), fontSize: 9, alignment: 'center'});
        return docDefinition;
      }

      // get summary content if present
      var summaryContent = angular.copy(docDefinition.content[1]);

      // split the table into pages with breaks
      var header = docDefinition.content[0].table.body.splice(0, 1);
      var table = docDefinition.content[0].table.body;
      var contentTemplate = docDefinition.content[0];
      docDefinition.content = [];
      do {
        var newRows = (table.length > rowsPerPage) ? rowsPerPage : table.length;
        var newTable = angular.copy(header).concat(table.splice(0, newRows));
        var newContent = angular.copy(contentTemplate);
        newContent.table.body = newTable;
        if (table.length > 0) {
          newContent.pageBreak = 'after';
        }
        docDefinition.content.push(newContent);
      } while (table.length > 0);

      if (summaryContent) {
        // if there's enough rows available add summary to last page, otherwise add it to a new page
        var availableRows = rowsPerPage - docDefinition.content[docDefinition.content.length - 1].table.body.length;
        var summaryRowsNr = summaryContent.table.body.length;
        if (availableRows < summaryRowsNr) {
          summaryContent.pageBreak = 'before';
        }
        docDefinition.content.push(summaryContent);
      }

      return docDefinition;
    },
    highlightTotalRows: function(columnText, columnTextIndex, docDefinition) {
      // set the cell style of each column in the row containing all/total data
      docDefinition.styles.greyBoldCell = this.pdfTableBodyGreyBoldStyle;
      angular.forEach(docDefinition.content, function(content) {
        angular.forEach(content.table.body, function(row) {
          if (row[columnTextIndex] === columnText) {
            angular.forEach(row, function(cell, index) {
              row[index] = { text: '' + cell, style: 'greyBoldCell'};
            });
          }
        });
      });

      return docDefinition;
    },
    highlightPercentageRows: function(columnText, columnTextIndex, docDefinition) {
      // set the cell style of each column in the row containing percentage data
      docDefinition.styles.boldCell = this.pdfTableBodyBoldStyle;
      angular.forEach(docDefinition.content, function(content) {
        angular.forEach(content.table.body, function(row) {
          if (row[columnTextIndex] === columnText) {
            angular.forEach(row, function(cell, index) {
              row[index] = { text: '' + cell, style: 'boldCell'};
            });
          }
        });
      });

      return docDefinition;
    },
    addPercentages: function(col, value) {
      if (col.field.indexOf('rate') !== -1) {
        return value + '%';
      }
      return value;
    },
    addSummaryContent: function(summaryData, docDefinition) {
      // adds the summary data, with the same layout as the rest of the doc, to the content array
      var summaryContent = angular.copy(docDefinition.content[0]);
      var header = summaryContent.table.body.splice(0, 1);
      summaryContent.table.body = header.concat(summaryData);
      docDefinition.content.push(summaryContent);
      return docDefinition;
    },
    formatPercentageColumnsAndConvertAllValuesToText: function(data, percentageColumnIndexes) {
      angular.forEach(data, function(row) {
        angular.forEach(row, function(value, index) {
          if (percentageColumnIndexes.indexOf(index) !== -1) {
            row[index] = $filter('number')(value, 2) + '%';
          } else {
            row[index] = '' + value;
          }
        });
      });
      return data;
    },
    formatPercentageRowsAndConvertAllValuesToText: function(data, percentageRowIdentifier, columnIndex) {
      angular.forEach(data, function(row) {
        angular.forEach(row, function(value, index) {
          if (row[columnIndex] === percentageRowIdentifier && row[index] !== '') {
            row[index] = $filter('number')(value, 2) + '%';
          } else {
            row[index] = '' + value;
          }
        });
      });
      return data;
    },
    convertAllValuesToText: function(data) {
      angular.forEach(data, function(row) {
        angular.forEach(row, function(value, index) {
          row[index] = '' + value;
        });
      });
      return data;
    },
    hyphenateLongWords: function(text, maxWordLength) {
      var newText = '';
      angular.forEach(text.split(' '), function(word) {
        // break word into chunks
        var hyphenWord = '';
        var chunkRegExp = new RegExp('.{1,' + maxWordLength + '}', 'g');
        angular.forEach(word.match(chunkRegExp), function(chunk) {
          if (hyphenWord.length > 0) {
            hyphenWord += '-';
          }
          hyphenWord += chunk;
        });
        // add hyphened word to display name
        if (newText.length > 0) {
          newText += ' ';
        }
        newText += hyphenWord;
      });
      return newText;
    }

  };

});
