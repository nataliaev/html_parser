const fs = require("fs");
const cheerio = require("cheerio");
var glob = require("glob");
const writeStream = fs.createWriteStream("market2.csv");

writeStream.write(
  `Post Id,Scrape Date,Item nr,Main category,Subcategory,Post title,Post date,Vendor,New Post,Post status,Title bold,Vendor nr,Views,Sales,Quantity left,Autodispatch,Price USD,Price BTC,Pay methods \n`
);

glob("../../testing/*", function(er, files) {
  let postId = 0;
  const scrapeDate = "Aug 05 2019";

  for (let x = 0; x < files.length; x++) {
    const fileName = files[x].toString();

    fs.readFile(fileName, (err, data) => {
      if (err) throw err;
      file = data.toString();
      const $ = cheerio.load(file);

      //unique for the post
      $(".col-1search").each((i, el) => {
        const item = $(el).html();
        const postBlock = cheerio.load(item);

        //post id
        postId += 1;

        //head
        const title = postBlock(".head a")
          .html()
          .replace(/[,;]/g, "");

        //vendor
        const vendor = postBlock(".head p a")
          .text()
          .replace(/[,;]/g, "");

        //item # and subsections
        const itemNumber = postBlock(".head p")
          .text()
          .split(" ")[2];
        const subsectionSplited = postBlock(".head p")
          .text()
          .split(" - ")[1]
          .split(/\n/);
        const mainSection = subsectionSplited[0]
          .slice(0, -1)
          .trim()
          .replace(/[,;]/g, "");
        const subsection = subsectionSplited[1].trim().replace(/[,;]/g, "");

        //vendor #
        const vendorNumberSplited = postBlock(".head p")
          .html()
          .split(" ");
        const vendorNumber = vendorNumberSplited[
          vendorNumberSplited.length - 1
        ].slice(1, -1);

        //console.log("Title:", title);
        //console.log("Vendor:", vendor);
        //console.log("Item #:", itemNumber);
        //console.log("Subsection:", subsection)
        //console.log("Main section:", mainSection)
        //console.log("Vendor #:", vendorNumber);

        writeStream.write(
          `${postId},${scrapeDate},${itemNumber},${mainSection},${subsection},${title},Post date,${vendor},New Post,Post status,Title bold,${vendorNumber},Views,Sales,Quantity left,Autodispatch,Price USD,Price BTC,Pay methods \n`
        );
      });
    });
  }
});
