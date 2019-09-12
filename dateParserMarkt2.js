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

