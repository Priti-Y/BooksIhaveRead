
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import pg from "pg";

const port = 3000;
const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "Books",
    password: "admin",
    port: 5432,
  });
  db.connect();
  
app.get("/",async (req,res) => {

    // var result = await axios.get(API_URL+"/random");
    // console.log(result.data);
    var results = await db.query("select b.id,b.title,b.description, b.author,b.isbn, r.rating, to_char(r.date_read_on,'mm-dd-yyyy') AS date_read_on from books as b INNER JOIN book_review as r ON b.id = r.book_id");
   // console.log(results.rows);
    res.render("index.ejs", {books : results.rows});

});
app.get("/book/:id",async (req,res) => {
   // console.log(req.params.id);
    var id = req.params.id;
    var results = await db.query("select b.id,b.title,b.description, b.author,b.isbn, r.notes, r.rating, to_char(r.date_read_on,'mm-dd-yyyy') AS date_read_on from books as b INNER JOIN book_review as r ON b.id = r.book_id where b.id = $1",[id]);
   // console.log(results.rows);
    res.render("book.ejs",{review : results.rows[0]});

});
app.post("/delete/:id",async (req,res) => {

    console.log(req.params.id);
    var id = req.params.id;
    // var results = await db.query("select b.id,b.title,b.description, b.author,b.isbn, r.rating, to_char(r.date_read_on,'mm-dd-yyyy') AS date_read_on from books as b INNER JOIN book_review as r ON b.id = r.book_id");
    // console.log(results.rows);
    res.redirect("/");

});
app.listen(port, () =>{
    console.log(`app is listening on ${port}`);
});
