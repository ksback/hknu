var csv_file = new File([hknu], "hknu.csv");

var data = csv_file.read().split('/\r\n|\n/'); // split by lines
csv_file.close();
    

console.log(data);

/*
let fileReader = new FileReader();



fileReader.readAsText(csv_file);

fileReader.addEventListener("load", viewText);

function viewText()
{
    console.log(fileReader.result);
}

*/





//console.log(file);

//let myCsv = 

function successFunction(data) {
    var allRows = data.split(/\r?\n|\r/);
    for (var singleRow = 0; singleRow < allRows.length; singleRow++) {
      var rowCells = allRows[singleRow].split(',');
      for (var rowCell = 0; rowCell < rowCells.length; rowCell++) {
        if (singleRow === 0) {
          table += rowCells[rowCell];
        } else {
          table += rowCells[rowCell];
        }
      }
    } 

  }