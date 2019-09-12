# HTML Parser

Made in collaboration with [CarlosEscat](https://github.com/CarlosEscat)

## Description

The parser was made for the research project of Vrije Universiteit Amsterdam. It is using the data from scraped html pages, searching for special information and saving it in scv files.

There are 4 types of pages. For each type we made separate parser, depending on the html structure of the documents.

## Main Libraries Used

-   [Cheerio](https://cheerio.js.org)
-   [Glob](https://www.npmjs.com/package/glob)
-   [Sequelize](https://sequelize.org)
-   [node-postgres](https://www.npmjs.com/package/pg)

## Installation

### Running the HTML Parser locally

-   Make sure you have installed all these prerequisites on your development machine.

    -   [Node.js](https://nodejs.org/en/download/)
    
-   Run commands in the Terminal

```
> git clone git@github.com:nataliaev/html_parser.git
> cd html_parser
> npm install
> node marktParser.js //use other file name to use other parser type
```
-   To run a PostgreSQL database (nessesary for markt2Parser.js & dateParserMarkt2.js)

    -   Install [docker](https://docs.docker.com/install)
    -   Run in yor Terminal:

```
> docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=secret postgres
```
