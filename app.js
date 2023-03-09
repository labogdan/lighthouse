// Import the required npm packages
const fs = require("fs");
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const { convertArrayToCSV } = require('convert-array-to-csv');
const converter = require('convert-array-to-csv');

let array = fs.readFileSync("URLs.csv")
                .toString().split("\n");
  
let result = [];
result.push(
  ", URL, Mobile_Performance, Mobile_Accessibility, Mobile_Best_Practices, Mobile_SEO, HTTPS, Viewport, Speed_Index, Errors, Server_Response_Time, Image_Aspect_Ratio, Image_Size_Responsive, Font_Display, Modern_Image_Formats, Optimized_Images, Text_Compression, Responsive_Images, Font_Size"
);
  
(async () => {
  const chrome = await chromeLauncher
    .launch({ chromeFlags: ["--headless"] })
  
  // Declaring an object to specify score 
  // for what audits, categories and type
  // of output that needs to be generated 
  const options = {
    logLevel: "info",
    output: "csv",
    onlyCategories: ["performance", 
      "accessibility", "best-practices", "seo", "pwa"],
    audits: [
      "first-meaningful-paint",
      "first-cpu-idle",
      "byte-efficiency/uses-optimized-images",
    ],
    strategy: "mobile",
    port: chrome.port,
  };
  
  // Traversing through each URL 
  for (i in array) {
  
      let configuration = "";
    
      const runnerResult = 
        await lighthouse(array[i], options);
  
    if (runnerResult.lhr.audits) {
        //console.log(runnerResult.lhr.audits);
        //console.log(runnerResult.lhr.audits.viewport.score);
        //console.log(runnerResult.lhr.audits['content-width'].score);
        //console.log(runnerResult.lhr.audits['load-fast-enough-for-pwa'].score);
    }

    const finalScreenshotFile = `data/screenshot-${runnerResult.lhr.finalUrl.split('://')[1].split('/')[0]}.jpg`;
    const finalScreenshot = runnerResult.lhr.audits['final-screenshot'].details.data.split(';base64,').pop();
    fs.writeFileSync(finalScreenshotFile, finalScreenshot, { encoding: 'base64' });

    const reportCsv = runnerResult.report;
  
    result.push("\n");
    result.push(runnerResult.lhr.finalUrl);
  
    //console.log(runnerResult.lhr.categories);

    runnerResult.lhr.categories.performance.score ? result.push(runnerResult.lhr.categories.performance.score * 100) : result.push("NA")
    runnerResult.lhr.categories.accessibility.score ? result.push(runnerResult.lhr.categories.accessibility.score * 100) : result.push("NA")
    runnerResult.lhr.categories["best-practices"].score ? result.push(runnerResult.lhr.categories["best-practices"].score * 100) : result.push("NA")
    runnerResult.lhr.categories.seo.score ? result.push(runnerResult.lhr.categories.seo.score * 100) : result.push("NA")
    
    runnerResult.lhr.audits['is-on-https'].score ? result.push("Pass") : result.push("Fail");
    runnerResult.lhr.audits.viewport.score ? result.push("Pass") : result.push("Fail");
    runnerResult.lhr.audits['speed-index'].score ? result.push(runnerResult.lhr.audits['speed-index'].score * 100) : result.push("NA");
    runnerResult.lhr.audits['errors-in-console'].score ? result.push("Pass") : result.push("Fail");
    runnerResult.lhr.audits['server-response-time'].score ? result.push("Pass") : result.push("Fail");
    runnerResult.lhr.audits['image-aspect-ratio'].score ? result.push("Pass") : result.push("Fail");
    runnerResult.lhr.audits['image-size-responsive'].score ? result.push("Pass") : result.push("Fail");
    runnerResult.lhr.audits['font-display'].score ? result.push("Pass") : result.push("Fail");
    runnerResult.lhr.audits['modern-image-formats'].score ? result.push("Pass") : result.push("Fail");
    runnerResult.lhr.audits['uses-optimized-images'].score ? result.push("Pass") : result.push("Fail");
    runnerResult.lhr.audits['uses-text-compression'].score ? result.push("Pass") : result.push("Fail");
    runnerResult.lhr.audits['uses-responsive-images'].score ? result.push(runnerResult.lhr.audits['uses-responsive-images'].score * 100) : result.push("NA");
    runnerResult.lhr.audits['font-size'].score ? result.push("Pass") : result.push("Fail");
  }
  

/*
  var objectToCSVRow = function(dataObject) {
    var dataArray = new Array;
    for (var o in dataObject) {
        var innerValue = dataObject[o]===null?'':dataObject[o].toString();
        var result = innerValue.replace(/"/g, '""');
        result = '"' + result + '"';
        dataArray.push(result);
    }
    return dataArray.join(' ') + '\r\n';
}

var exportToCSV = function(arrayOfObjects) {

    if (!arrayOfObjects.length) {
        return;
    }

    var csvContent = "data:text/csv;charset=utf-8,";

    // headers
    //csvContent += objectToCSVRow(Object.keys(arrayOfObjects[0]));
    csvContent += '"Column name 1" "Column name 2" "Column name 3"\n';

    arrayOfObjects.forEach(function(item){
        csvContent += objectToCSVRow(item);
    }); 

    console.log(csvContent);
}
exportToCSV(result);
*/


let csv = result.join();

/*var csv = result.map(function(d){
    console.log(d);
    return d.join();
}).join('\n');*/


  // Append the result in a report.csv 
  // file and end the program

  


  fs.appendFileSync("data/mobile-report.csv", csv);
  console.log('Complete!');
  await chrome.kill();
})();