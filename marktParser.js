const fs = require("fs");
const cheerio = require("cheerio");
var glob = require("glob");
const writeStream = fs.createWriteStream("market.csv");

writeStream.write(
  `Post Id,Scrape Date,Item nr,Main category,Subcategory,Post title,Post date,Vendor,New Post,Positive feedback,Level seller,Level trust,Sales vendor,Verified vendor,Trusted vendor,Views,Sales,Quantity left,Autodispatch, Price USD, Price BTC \n`
);

glob("../../testing/*", function(er, files) {
  let postId = 0;
  const scrapeDate = "Aug 01 2019";

  for (let x = 0; x < files.length; x++) {
    const fileName = files[x].toString();

    fs.readFile(fileName, (err, data) => {
      if (err) throw err;
      file = data.toString();
      const $ = cheerio.load(file);

      //unique for the post
      $("tbody tr").each((i, el) => {
        const item = $(el).html();
        const postBlock = cheerio.load(item);

        //post title
        const titleBlock = postBlock(".col-sm-8 small a").html();
        let title = "";
        if (titleBlock) {
          title = titleBlock.replace(/[,;]/g, "");
        }

        //item #, main section and subsection
        const itemBlock = postBlock(".col-sm-8 small")[1];
        let itemNumber = "";
        let mainSection = "";
        let subSection = "";
        let vendor = "";
        let feedback = 0
        let levelSeller = 0
        let salesVendor = 0
        let levelTrust = 0

        if (itemBlock) {
          //post id
          postId += 1;

          itemNumber = itemBlock.children[0].data
            .split(" ")[1]
            .replace(/[,;]/g, "")

          mainSection = itemBlock.children[3].children[0].data
          .replace(/[,;]/g, "")

          subSection = itemBlock.children[5].children[0].data
          .replace(/[,;]/g, "")

          const vendorAndFeedback = itemBlock.children[7].children[0].children[0].data.split(" ");
          vendor = vendorAndFeedback[0].replace(/[,;]/g, "")
          feedback = vendorAndFeedback[1].slice(1,(vendorAndFeedback[1].length - 1)).replace(/[,;]/g, "")

          levelSellerAndSalesVendor = itemBlock.children[9].children[0].children[0].data.split(" ")
          levelSeller = levelSellerAndSalesVendor[2]
          salesVendor = levelSellerAndSalesVendor[3].slice(1,(levelSellerAndSalesVendor[3].length - 1))

          const levelTrustSplited = itemBlock.children[11].children[0].children[0].data.split(" ")
          levelTrust = levelTrustSplited[levelTrustSplited.length - 1]
        }

        //verified
        const verifiedBlock = postBlock(".col-sm-8 small span img").attr("src");
        let verified = "";
        if (verifiedBlock) {
          if (verifiedBlock === "uploads/icons/yes_verified.png") {
            verified = 1
          } else if (verifiedBlock === "uploads/icons/not_verified.png") {
            verified = 2
          } else {
            verified = "no information"
          }
        }

        //trusted
        const trustedBlock = postBlock(".col-sm-8 small")[5].children[0].children[0].next.attribs["src"]
        let trusted = "";
        if (trustedBlock) {
          if (trustedBlock === "uploads/icons/yes_trusted.png") {
            trusted = 1
          } else if (trustedBlock === "uploads/icons/not_trusted.png") {
            trusted = 2
          } else {
            trusted = "no information"
          }
        }

        //post date
        const postDateBlock = postBlock(".col-sm-8 small i").text();
        let postDate = "";
        if (postDateBlock) {
          postDate = postDateBlock.replace(/[,;]/g, "")
        }

        let newPost = 2
        if (scrapeDate === postDate) {
          newPost = 1
        }

        //saving to csv file
        writeStream.write(
          `${postId},${scrapeDate},${itemNumber},${mainSection},${subSection},${title},${postDate},${vendor},${newPost},${feedback},${levelSeller},${levelTrust},${salesVendor},${verified},${trusted} \n`
        );
      });
    });
  }
});
