const fs = require("fs");
const cheerio = require("cheerio");
var glob = require("glob");
const writeStream = fs.createWriteStream("test1.csv");

writeStream.write(
  `Post Id,Scrape Date,Subsections,Section pages,Post title,Post date,Post time,Poster,New Post,Post tag,Post status,Status poster,Avatar changed,Replies,Views,Likes,Page number,Last poster,Status last poster,Last post time \n`
);

let file = "";

function usergroups(color, style) {
  switch (color) {
    case "f24b4b":
      return 1;
    case "ed7a16":
      return 2;
    case "028e6b":
      return 3;
    case "26f6a5":
      return 4;
    case "c61aff":
      return 5;
    case "a868ed":
      return 6;
    case "CF2D9F":
      return 8;
    case "FFDF00":
      return 9;
    case "54FF9F":
      return 10;
    case "ff99b1":
      return 11;
    case "4DD5D5":
      return 12;
    case "8ed7d4":
      return 13;
    default:
      return style.replace(/\,/g, "");
  }
}

const convertTime12to24 = time12h => {
  const [time, modifier] = time12h.split(" ");

  let [hours, minutes] = time.split(":");

  if (hours === "12") {
    hours = "00";
  }

  if (modifier === "PM") {
    hours = parseInt(hours, 10) + 12;
  }

  return `${hours}:${minutes}`;
};

glob("../../testing/*.html", function(er, files) {
  let postId = 0;

  for (let x = 0; x < files.length; x++) {
    const fileName = files[x].toString();

    fs.readFile(fileName, (err, data) => {
      if (err) throw err;
      file = data.toString();
      const $ = cheerio.load(file);

      //common for the page

      const section_pages = $(".pagination_last").html();

      const pagination_current = $(".pagination_current").html();

      const subsections = $(".active").text();

      let scrapeDate = fileName.split("_");
      scrapeDate = scrapeDate[2].split(".");
      scrapeDate = scrapeDate[0];

      //unique for the post
      $("tbody tr").each((i, el) => {
        const item = $(el).html();
        const postBlock = cheerio.load(item);

        //post title
        const titleBlock = postBlock(".subject_new a").children()[0];
        let title = "";
        if (titleBlock) {
          postId += 1;
          title = titleBlock.children[0].data.replace(/\,/g, "");
          console.log("Post title:", title);
        }

        //post status
        const postStatusBlock = postBlock(".thread_status").attr("title");
        let postStatus
        if (postStatusBlock) {
          postStatus = postStatusBlock.replace(/\,/g, "")
          console.log("Post status:", postStatusBlock);
        }

        //each author and post date, post time, new post, poster status
        const authorAndDate = postBlock(".author").text();
        if (authorAndDate.length > 15) {
          const authorAndDateSplited = authorAndDate.split(" - ");
          const author = authorAndDateSplited[0].replace(/\,/g, "");
          const dateAndTime = authorAndDateSplited[1];
          const timeAMPM = dateAndTime
            .slice(dateAndTime.length - 8, dateAndTime.length)
            .replace(/\,/g, "");
          const time = convertTime12to24(timeAMPM);
          let date = dateAndTime
            .slice(0, dateAndTime.length - 10)
            .replace(/,/, "");
          let newPost = 2;

          if (date === "Today") {
            newPost = 1;
            date = scrapeDate;
          }

          console.log("Post author:", author);
          console.log("Post date:", date);
          console.log("Post time:", time);
          console.log("New post:", newPost);

          console.log("Total pages:", section_pages);
          console.log("Current page:", pagination_current);
          console.log("Subsection:", subsections);

          const authorStatus = postBlock(".author a span");
          let posterStatus;
          if (authorStatus) {
            if (authorStatus.attr("style")) {
              const posterStatusSplited = authorStatus
                .attr("style")
                .slice(0, 15)
                .trim()
                .split("#");
              if (posterStatusSplited[1]) {
                const color = posterStatusSplited[1].slice(0, 6);
                posterStatus = usergroups(color, authorStatus.attr("style"));
              } else {
                posterStatus = 14;
              }
            } else if (authorStatus.attr("class") === "rainbow_name") {
              posterStatus = 17;
            } else if (authorStatus.attr("class")) {
              posterStatus = 7;
            } else if (postBlock(".author a s").text()) {
              posterStatus = 16;
            } else {
              posterStatus = 15;
            }
          }
          console.log("Poster status:", posterStatus);

          const avatarBlock = postBlock(".last-post-avatar").attr("src");
          let avatar = 1;
          if (avatarBlock === "images/default_avatar.png") {
            avatar = 1;
          } else if (
            avatar !== "images/default_avatar.png" &&
            avatar !== undefined
          ) {
            avatar = 2;
          }
          console.log("Avatar:", avatar);

          //Likes
          const likes = parseInt(postBlock(".stats-likes").html());
          console.log("Likes:", likes);

          //Last comment time
          const lastCommentTimeBlock = postBlock(
            ".lastpost.smalltext.thread-date"
          )
            .children()
            .attr("title");

          let lastCommentTime = lastCommentTimeBlock;
          if (!lastCommentTimeBlock) {
            lastCommentTime = postBlock(
              ".lastpost.smalltext.thread-date"
            ).text();
          }
          lastCommentTime = lastCommentTime.replace(/,/, "");
          console.log("Last comments time:", lastCommentTime);

          //post tag
          const tagBlock = postBlock("div span span").html();
          const tagBlock2 = postBlock("div span b").html();
          let tag;
          if (tagBlock && tagBlock.length < 15) {
            tag = tagBlock;
          } else if (tagBlock2 && tagBlock2.length < 15) {
            tag = tagBlock2;
          } else {
            tag = 0;
          }
          console.log("Tag:", tag);

          //replies and views
          let replies = postBlock("#stats-count").html();
          const repliesAndViews = postBlock("#stats-count").text();
          let views = 0;
          if (repliesAndViews.length > 0) {
            views = parseInt(repliesAndViews.slice(replies.length));
            replies = parseInt(replies)
          }
          console.log("Replies:", replies);
          console.log("Stats:", views);

          //comments author
          let commentAuthor = "";
          let commentPosterStatus;
          if ($(el).children()[4]) {
            const comment = $(el, "td a span").text();
            const commentAuthorBlock = comment.match(/Last Post: \S+/);
            if (commentAuthorBlock) {
              const commentAuthorSplited = commentAuthorBlock[0].split(": ");
              commentAuthor = commentAuthorSplited[1].replace(/\,/g, "");
              console.log("CommentAuthor:", commentAuthor);
            }

            //comments author status
            const commentAuthorStyle = $(el)
              .find(".hide-mobile.row a span")
              .attr("style");

            if (commentAuthorStyle) {
              const commentStatusSplited = commentAuthorStyle
                .slice(0, 15)
                .trim()
                .split("#");
              if (commentStatusSplited[1]) {
                const color = commentStatusSplited[1].slice(0, 6);
                commentPosterStatus = usergroups(color, commentAuthorStyle);
              } else {
                commentPosterStatus = 14;
              }
            } else if (
              $(el)
                .find(".hide-mobile.row a span")
                .attr("class") === "rainbow_name"
            ) {
              commentPosterStatus = 17;
            } else if (
              $(el)
                .find(".hide-mobile.row a span")
                .attr("class")
            ) {
              commentPosterStatus = 7;
            } else if (
              $(el)
                .find(".hide-mobile.row a s")
                .html()
            ) {
              commentPosterStatus = 16;
            } else {
              commentPosterStatus = 15;
            }
            console.log("Comment poster status:", commentPosterStatus);
          }
          writeStream.write(
            `${postId},${scrapeDate},${subsections},${section_pages},${title},${date},${time},${author},${newPost},${tag},${postStatus},${posterStatus},${avatar},${replies},${views},${likes},${pagination_current},${commentAuthor},${commentPosterStatus},${lastCommentTime} \n`
          );
        }
      });
    });
  }
});
