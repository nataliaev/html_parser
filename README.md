# HTML Parser

Made in collaboration with [CarlosEscat](https://github.com/CarlosEscat)

## Description

The parser was made for the research project of Vrij University of Amsterdam. It is using the data from scraped html pages, searching for special information and saving it in scv files.

There are 4 types of pages. For each type we made separate parser, depending on the html structure of the documents.

## Main Libraries Used

-   [Cheerio](https://cheerio.js.org)
-   [Glob](https://www.npmjs.com/package/glob)

## Installation

### Running the HTML Parser locally

-   Make sure you have installed all these prerequisites on your development machine.

    -   [Node.js](https://nodejs.org/en/download/)

```bash
> git clone git@github.com:nataliaev/html_parser.git
> cd html_parser
> npm install
> node marktParser.js //use other file name to use other parser type
```
