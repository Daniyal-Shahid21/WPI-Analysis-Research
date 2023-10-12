function AnnoScraper() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0]; 

  var annos = []; // Array to store lines of code from Github
  var annosLineNum = []; // Array to store annotation lines from Github
  var annotationTypes = {}; // Object to store annotation types and their counts
  var substr = "@org.checkerframework"; 
  var rangeValues = sheet.getRange("A:A").getValues();

  for (var j = 0; j < rangeValues.length; j++) {
    var row = rangeValues[j];
    for (var k = 0; k < row.length; k++) {
      if (row[k].includes(substr)) {
        annos.push(row[k]); // Add the entire line containing the annotation to the annos array
        annosLineNum.push(j + 1); // Add the line number to annosLineNum array
        // Extract annotation types using regex
        var annotationsInRow = row[k].match(/(@org\.checkerframework\S+)/g); 
        // Extract annotation types
        if (annotationsInRow) {
          annotationsInRow.forEach(function(annotation) {
            annotation = annotation.trim();
            annotationTypes[annotation] = (annotationTypes[annotation] || 0) + 1;
          });
        }
      }
    }
  }

  var annosSS = ss.insertSheet("Annotation Information");

  var data = [["Annotation Type", "Count", "Total Number of Annotations", "LoC Number", "Annotations"]];
  var range = annosSS.getRange("A1:E1"); 
  range.setValues(data);
  range.setFontWeight("bold");

  var columnDRange = annosSS.getRange("D2:D" + (annosLineNum.length + 1));
  columnDRange.setValues(annosLineNum.map(function(value) {
    return [value];
  }));

  var columnERange = annosSS.getRange("E2:E" + (annos.length + 1));
  columnERange.setValues(annos.map(function(value) {
    return [value];
  }));

  var totalAnnos = annosSS.getRange("E2:E" + annosSS.getLastRow()).getValues();
  var totalAnnotations = 0;

  for (var j = 0; j < totalAnnos.length; j++) {
    var row = totalAnnos[j][0];
    var rowParts = row.split(/(@org\.checkerframework)/); // Split only when '@org.checkerframework' is found

    if (rowParts.length > 1) {
      for (var k = 0; k < rowParts.length; k++) {
        if (k % 2 === 0) {
          // If the part is even (before '@org.checkerframework'), set it in the current cell, this happens when no more annotations are connected
          annosSS.getRange(j + 2, 5 + k / 2).setValue(rowParts[k].trim());
        } 
        else {
          // If the part is odd (after '@org.checkerframework'), set it in the next cell, repeat until there is no annotations left unseperated
          annosSS.getRange(j + 2, 5 + k / 2).setValue('@org.checkerframework' + rowParts[k].trim());
          totalAnnotations++;
        }
      }
    } 
    else {
      // If there is no '@org.checkerframework' found, set the entire row in the current cell
      annosSS.getRange(j + 2, 5).setValue(row.trim());
    }
  }
  
  annosSS.getRange("C2").setValue(totalAnnotations);
  // Set the total annotation amount

  // Add annotation types and their counts to column A and B
  var annotationData = [];
  for (var annotationType in annotationTypes) {
    annotationData.push([annotationType, annotationTypes[annotationType]]);
  }
  annosSS.getRange("A2:B" + (annotationData.length + 1)).setValues(annotationData);
  // Set the annotation types and lines
}