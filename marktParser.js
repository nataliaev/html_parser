const fs = require("fs");
const cheerio = require("cheerio");
var glob = require("glob");
const writeStream = fs.createWriteStream("market.csv");

glob("../../testing/*", function(er, files) {
  //let postId = 0;

  for (let x = 0; x < files.length; x++) {
    const fileName = files[x].toString();
    console.log(fileName);

    if (fileName.slice(-4) !== ".txt") {
      console.log("ENTERED FILE NAME: ", fileName);
      fs.readFile(fileName, (err, data) => {
        if (err) throw err;
        file = data.toString();
        const $ = cheerio.load(file);

        //USD price and BTC price
        $("tbody tr").each((i, el) => {
          const item = $(el).html();
          const block = cheerio.load(item);
          let price = block(".col-sm-3 small span").text();
          price = price.split(" ");
          const usdPrice = price[3] + " USD";
          const btcPrice = price[6] + " BTC";
          console.log(usdPrice + " - " + btcPrice);
        });

        //Autodispatch and Quantity left
        let autodispatch = "";
        let quantityLeft = "";
        $("tbody tr").each((i, el) => {
          const item = $(el).html();
          const block = cheerio.load(item);
          autodispatch = block(".col-sm-8 small span").text();
          const mySubString = autodispatch.substring(
            autodispatch.lastIndexOf("Quantity :") + 11,
            autodispatch.lastIndexOf("Sold")
          );

          if (mySubString.charAt(0) === "(") {
            autodispatch = "yes";
          } else {
            autodispatch = "no";
          }
          if (autodispatch === "yes") {
            quantityLeft = mySubString.split(")");
            quantityLeft = quantityLeft[1].split(" ");
            quantityLeft = quantityLeft[1];
          } else {
            quantityLeft = mySubString.split(" ");
            quantityLeft = quantityLeft[0];
          }

          console.log("Autodispatch: ", autodispatch);
          console.log("Quantity: ", quantityLeft);
        });

        //Views and Sales
        let sales = "";
        let views = "";
        $("tbody tr").each((i, el) => {
          const item = $(el).html();
          const block = cheerio.load(item);
          const soldViewBlock = block(".col-sm-8 small span").text();
          sales = soldViewBlock.substring(
            soldViewBlock.lastIndexOf("Sold :") + 6,
            soldViewBlock.lastIndexOf("/")
          );
          views = soldViewBlock.split(" ");
          const lengthViews = views.length;
          views = views[lengthViews - 1];

          console.log("Sales: ", sales);
          console.log("Views: ", views);
        });
      });
    }
  }
});
