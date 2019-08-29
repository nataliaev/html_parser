const fs = require("fs");
const cheerio = require("cheerio");
var glob = require("glob");
const writeStream = fs.createWriteStream("market.csv");

writeStream.write(
  `Post Id,Scrape Date,Subsections,Section pages,Post title,Post date,Post time,Poster,New Post,Post tag,Post status,Status poster,Avatar changed,Replies,Views,Likes,Page number,Last poster,Status last poster,Last post time \n`
);

glob("../../testing/*", function(er, files) {
  //let postId = 0;

  for (let x = 0; x < files.length; x++) {
    const fileName = files[x].toString();
    console.log(fileName)

    fs.readFile(fileName, (err, data) => {
      if (err) throw err;
      file = data.toString();
      const $ = cheerio.load(file);
    })
  }
})