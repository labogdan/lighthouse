// Import the required npm packages
const fs = require("fs");
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const { convertArrayToCSV } = require('convert-array-to-csv');
const converter = require('convert-array-to-csv');


function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
}

let array = fs.readFileSync("data/input/urls.csv")
                .toString().split("\n");
  
let result = [];
result.push(
  ", URL, Mobile_Performance, Mobile_Accessibility, Mobile_Best_Practices, Mobile_SEO, HTTPS, Viewport, Speed_Index, Errors, Server_Response_Time, Image_Aspect_Ratio, Image_Size_Responsive, Font_Display, Modern_Image_Formats, Optimized_Images, Text_Compression, Responsive_Images, Font_Size"
);
  
console.log(array);

async function launch() {

  for (i in array) {
  
    console.log('waiting');
    await wait(2000);
    
    console.log('ok');

  const chrome = await chromeLauncher
  .launch({ 
    chromeFlags: [
      //'--no-first-run',
      '--headless'//,
      //'--disable-gpu',
      //'--no-sandbox'
    ]
  })

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

    
  

    console.log(i);

    let configuration = "";
    
    try {
    const runnerResult = 
      await lighthouse(array[i], options);

      console.log('************lighthouse results')
  
    if (runnerResult.lhr.audits) {
        console.log(runnerResult.lhr.audits);
        //console.log(runnerResult.lhr.audits.viewport.score);
        //console.log(runnerResult.lhr.audits['content-width'].score);
        //console.log(runnerResult.lhr.audits['load-fast-enough-for-pwa'].score);
    }

    const finalScreenshotFile = `data/output/screenshot-${runnerResult.lhr.finalUrl.split('://')[1].split('/')[0]}.jpg`;
    const finalScreenshot = runnerResult.lhr.audits['final-screenshot'].details ? runnerResult.lhr.audits['final-screenshot'].details.data.split(';base64,').pop() : null;
    finalScreenshot && fs.writeFileSync(finalScreenshotFile, finalScreenshot, { encoding: 'base64' });

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
    
    let csv = result.join();
    result = [];
    fs.appendFileSync("data/output/mobile-report.csv", csv);
    console.log('Complete!');
    await chrome.kill();
    } catch (e) {
      console.error(e);
      await chrome.kill();
    }
    

  }


}

(async () => {

  console.log('launching');
  await launch();
  console.log('done');
  
})();