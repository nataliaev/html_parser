const fs = require("fs");
const cheerio = require("cheerio");
var glob = require("glob");

let dateAndNumbers = [];

glob("../../testing/*", function (er, files) {
  for (let x = 0; x < files.length; x++) {
    const fileName = files[x].toString();

    fs.readFile(fileName, (err, data) => {
      if (err) throw err;
      file = data.toString();
      const $ = cheerio.load(file);

      const title = $(".right-content div div h2")
        .html()
        .replace(/[,;]/g, "")

      const dateSplited = $(".listDes p span")
        .html()
        .replace(/[,;]/g, "")
        .split(" ");
      const date =
        dateSplited[dateSplited.length - 3] +
        " " +
        dateSplited[dateSplited.length - 2] +
        " " +
        dateSplited[dateSplited.length - 1];

      dateAndNumbers = [...dateAndNumbers, { name: title, date: date }];
      console.log(dateAndNumbers);
    });
  }
});


