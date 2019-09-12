const fs = require("fs");
const cheerio = require("cheerio");
var glob = require("glob");
var pg = require("pg");

var connectionString = "postgres://postgres:secret@localhost:5432/postgres";
var pgClient = new pg.Client(connectionString);
pgClient.connect().then(() => {
  const writeStream = fs.createWriteStream("empire2907.csv"); //change me 1

  writeStream.write(
    `Post Id,Scrape Date,Item nr,Main category,Subcategory,Post title,Post date,Vendor,New Post,Post status,Title bold,Vendor nr,Views,Sales,Quantity left,Autodispatch,Price USD,Price BTC,Pay methods \n`
  );

  //change me 2
  glob(
    "../../testing/empire2907/ano4q5hgjfepr27h.onion/category/categories/+(**)/*",
    async function(er, files) {
      let postId = 284203; //change me 3
      const scrapeDate = "July 29 2019"; //change me 4
      let itemNumber;
      let mainSection;
      let subsection;
      let title;
      let vendor;
      let postStatus;
      let titleBold;
      let vendorNumber;
      let views;
      let sales;
      let quantityLeft;
      let autodispatch;
      let priceUSD;
      let priceBTC;
      let payMethods;

      for (let x = 0; x < files.length; x++) {
        const fileName = files[x].toString();

        const data = fs.readFileSync(fileName);

        // if (err) throw err;
        file = data.toString();
        const $ = cheerio.load(file);

        let postsFromAPage = [];

        //unique for the post
        $(".col-1search").each((i, el) => {
          const item = $(el).html();
          const postBlock = cheerio.load(item);

          //post status
          const postStatusBlock = postBlock(".head b").html();
          postStatus = 2;
          if (postStatusBlock === "[sticky]") {
            postStatus = 1;
          }

          //title
          title = postBlock(".head a")
            .html()
            .replace(/[,;]/g, "");

          //post id
          postId += 1;

          //vendor
          vendor = postBlock(".head p a")
            .text()
            .replace(/[,;]/g, "");

          //item # and subsections
          itemNumber = postBlock(".head p")
            .text()
            .split(" ")[2];
          const subsectionSplited = postBlock(".head p")
            .text()
            .split(" - ")[1]
            .split(/\n/);
          mainSection = subsectionSplited[0]
            .slice(0, -1)
            .trim()
            .replace(/[,;]/g, "");
          subsection = subsectionSplited[1].trim().replace(/[,;]/g, "");

          //vendor #
          const vendorNumberSplited = postBlock(".head p")
            .html()
            .split(" ");
          vendorNumber = vendorNumberSplited[
            vendorNumberSplited.length - 1
          ].slice(1, -1);

          //title bold
          titleBold = 2;
          if ($(el).attr("style")) {
            titleBold = 1;
          }

          //views
          const viewsBlock = postBlock(".head").text();
          views = viewsBlock.match(/Views: \S+/)[0].split(" ")[1];
          sales = viewsBlock.match(/Sales: \S+/)[0].split(" ")[1];
          quantityLeft = viewsBlock
            .match(/Quantity left: \S+/)[0]
            .split(" ")[2];
          autodispatch = 2;
          if (viewsBlock.includes("automatic")) {
            autodispatch = 1;
          }

          //price
          const priceBlock = postBlock(".col-1right").text();
          priceUSD = priceBlock
            .match(/USD \S+/)[0]
            .split(" ")[1]
            .replace(/[,;]/g, "");
          priceBTC = priceBlock
            .match(/\S+ BTC/)[0]
            .split(" ")[0]
            .slice(1)
            .replace(/[,;]/g, "");

          //pay methods
          const payMethodsBlock = postBlock(".padp")[3];
          const payMethodsIcon = payMethodsBlock.children.map(child => {
            if (child.name === "img") {
              if (
                child.attribs.src ===
                  "http://46qkrbfcaa4gsc3m.onion/public/image/btc_small.png" ||
                child.attribs.src ===
                  "http://t5ocmsgrmxm2rehb.onion/public/image/btc_small.png"
              ) {
                return "btc ";
              } else if (
                child.attribs.src ===
                  "http://46qkrbfcaa4gsc3m.onion/public/image/ltc_small.png" ||
                child.attribs.src ===
                  "http://t5ocmsgrmxm2rehb.onion/public/image/ltc_small.png"
              ) {
                return "ltc ";
              } else if (
                child.attribs.src ===
                  "http://46qkrbfcaa4gsc3m.onion/public/image/xmr_small.png" ||
                child.attribs.src ===
                  "http://t5ocmsgrmxm2rehb.onion/public/image/xmr_small.png"
              ) {
                let newRow = "";
                return "xmr ";
              }
            } else {
              return "";
            }
          });
          payMethods = payMethodsIcon.reduce((str, el) => str + el);

          let newRow = {
            postStatus,
            title,
            postId,
            vendor,
            itemNumber,
            mainSection,
            subsection,
            vendorNumber,
            titleBold,
            views,
            sales,
            quantityLeft,
            autodispatch,
            priceUSD,
            priceBTC,
            payMethods
          };

          postsFromAPage = postsFromAPage.concat(newRow);
        });

        let newPost;
        let dateFromDataBase;

        for (let i = 0; i < postsFromAPage.length; i++) {

          const {
            postStatus,
            title,
            postId,
            vendor,
            itemNumber,
            mainSection,
            subsection,
            vendorNumber,
            titleBold,
            views,
            sales,
            quantityLeft,
            autodispatch,
            priceUSD,
            priceBTC,
            payMethods
          } = postsFromAPage[i];

          const query = await pgClient
            .query(`SELECT * from posts where title = '${title}'`)
            .then(res => {
              if (res.rows.length > 0) {
                dateFromDataBase = res.rows[0].date;
                newPost = dateFromDataBase === scrapeDate ? 1 : 2;
                writeStream.write(
                  `${postId},${scrapeDate},${itemNumber},${mainSection},${subsection},${title},${dateFromDataBase},${vendor},${newPost},${postStatus},${titleBold},${vendorNumber},${views},${sales},${quantityLeft},${autodispatch},${priceUSD},${priceBTC},${payMethods} \n`
                );
              }
            });
        }
      }
    }
  );
});
