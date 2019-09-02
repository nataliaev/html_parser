const fs = require("fs");
const cheerio = require("cheerio");
var glob = require("glob");
const Sequelize = require("sequelize");

databaseUrl = "postgres://postgres:secret@localhost:5432/postgres";
const db = new Sequelize(databaseUrl);

db.sync()
  .then(() => console.log("DataBase was updated"))
  .catch(console.error);

const Post = db.define("post", {
  title: Sequelize.STRING,
  date: Sequelize.STRING
});

glob("../../testing/product/+(**)/+(**)/*", function(er, files) {
  for (let x = 0; x < files.length; x++) {
    const fileName = files[x].toString();

    fs.readFile(fileName, (err, data) => {
      if (err) throw err;
      file = data.toString();
      const $ = cheerio.load(file);

      let title = "unknown";
      if ($(".right-content div div h2").html()) {
        title = $(".right-content div div h2")
          .html()
          .replace(/[,;]/g, "");
      }

      let date = "unknown";
      if ($(".listDes p span").html()) {
        const dateSplited = $(".listDes p span")
          .html()
          .replace(/[,;]/g, "")
          .split(" ");
        date =
          dateSplited[dateSplited.length - 3] +
          " " +
          dateSplited[dateSplited.length - 2] +
          " " +
          dateSplited[dateSplited.length - 1];
      }

      Post.create({
        title: title,
        date: date
      })
    });
  }
});

const writeStream = fs.createWriteStream("empire.csv");

writeStream.write(
  `Post Id,Scrape Date,Item nr,Main category,Subcategory,Post title,Post date,Vendor,New Post,Post status,Title bold,Vendor nr,Views,Sales,Quantity left,Autodispatch,Price USD,Price BTC,Pay methods \n`
);

glob(
  "../../testing/empire0108/t5ocmsgrmxm2rehb.onion/category/categories/+(**)/*",
  function(er, files) {
    //"../../testing/empire0108/t5ocmsgrmxm2rehb.onion/category/categories/+(1|3|5|8|9|11|12|43)/*",
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

          //post status
          const postStatusBlock = postBlock(".head b").html();
          let postStatus = 2;
          if (postStatusBlock === "[sticky]") {
            postStatus = 1;
          }

          //title
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

          //title bold
          let titleBold = 2;
          if ($(el).attr("style")) {
            titleBold = 1;
          }

          //views
          const viewsBlock = postBlock(".head").text();
          const views = viewsBlock.match(/Views: \S+/)[0].split(" ")[1];
          const sales = viewsBlock.match(/Sales: \S+/)[0].split(" ")[1];
          const quantityLeft = viewsBlock
            .match(/Quantity left: \S+/)[0]
            .split(" ")[2];
          let autodispatch = 2;
          if (viewsBlock.includes("automatic")) {
            autodispatch = 1;
          }

          //price
          const priceBlock = postBlock(".col-1right").text();
          const priceUSD = priceBlock
            .match(/USD \S+/)[0]
            .split(" ")[1]
            .replace(/[,;]/g, "");
          const priceBTC = priceBlock
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
                return "xmr ";
              }
            } else {
              return "";
            }
          });
          const payMethods = payMethodsIcon.reduce((str, el) => str + el);

          //post date
          const postDateFromDataBase = Post.findOne({
            where: { name: title }
          }).then(response => console.log(response.body));
          // console.log(postDateFromDataBase);

          //new post
          // let newPost = 2
          // if (postDate === scrapeDate) {
          //   newPost = 1
          // }

          // console.log(newPost)

          writeStream.write(
            `${postId},${scrapeDate},${itemNumber},${mainSection},${subsection},${title},Post date,${vendor},New Post,${postStatus},${titleBold},${vendorNumber},${views},${sales},${quantityLeft},${autodispatch},${priceUSD},${priceBTC},${payMethods} \n`
          );
        });
      });
    }
  }
);