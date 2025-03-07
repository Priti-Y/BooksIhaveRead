
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const port = 3000;
const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

//database connection
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "Books",
    password: "admin",
    port: 5432,
  });
  db.connect();
  
app.get("/",async (req,res) => {
    try {
        var results = await db.query("select b.id,b.title,b.description, b.author,b.isbn, r.rating, to_char(r.date_read_on,'mm-dd-yyyy') AS date_read_on from books as b INNER JOIN book_review as r ON b.id = r.book_id");
        res.render("index.ejs", {books : results.rows});
    }
    catch(err) {
        console.log(err);
    }

});
app.get("/book/:id",async (req,res) => {
   // console.log(req.params.id);
    var id = req.params.id;
    try {
        var results = await db.query("select b.id,b.title,b.description, b.author,b.isbn, r.notes, r.rating, to_char(r.date_read_on,'mm-dd-yyyy') AS date_read_on from books as b INNER JOIN book_review as r ON b.id = r.book_id where b.id = $1",[id]);
    // console.log(results.rows);
        res.render("editbook.ejs",{review : results.rows[0] ,mode: 'view'});
    }
    catch(err) {
        console.log(err);
    }
});
 //method will delet ebook entry from both tables
app.get("/delete/:id",async (req,res) => {

    console.log(req.params.id);
    var id = req.params.id;
    try {
        await db.query("delete from book_review where book_id=$1",[id]);
        await db.query("delete from books where id=$1",[id]);
    }
    catch(err) {
        console.log(err);
    }

    res.redirect("/");

});
 //method is landing page for edit screen
app.get("/edit/:id",async (req,res) => {

     var id = req.params.id;
     try {
        var results = await db.query("select b.id,b.title,b.description, b.author,b.isbn, r.notes, r.rating, to_char(r.date_read_on,'mm-dd-yyyy') AS date_read_on from books as b INNER JOIN book_review as r ON b.id = r.book_id where b.id = $1",[id]);

        res.render("editbook.ejs",{review : results.rows[0], mode: 'edit'});
    }
    catch(err) {
        console.log(err);
    }
 
 });
//method will edit notes and ratign details of  book
 app.post("/edit/:id",async (req,res) => {
    console.log(req.body);
    var id = req.params.id;
    var rating =req.body.Rating;
    var notes =req.body.notes;
    try {
        var results = await db.query("update book_review set rating = $1,notes = $2 where book_id = $3",[rating,notes,id]);       
    }
    catch(err) {
        console.log(err);
    }
    res.redirect("/");
 
 });
 // get landing page for opening add book page
 app.get("/add",async (req,res) => {
    res.render("book.ejs");
 });

 //method will add new book entry and its review in database tables
 app.post("/create",async (req,res) => {
    var title = req.body.title;
    var description = req.body.description;
    var author = req.body.author;
    var isbn = req.body.isbn;
    var rating = req.body.rating;
    var notes = req.body.notes;
    var date_read_on = req.body.date;
    try {
        var results = await db.query("INSERT INTO books(title, description, author, isbn) VALUES ($1, $2, $3, $4) RETURNING id",[title,description,author,isbn] );
        var id = results.rows[0].id;
        var results = await db.query("INSERT INTO book_review(notes, date_read_on, rating, book_id) VALUES ($1, $2, $3, $4)",[notes,date_read_on,rating,id] );

    } catch(err) {
        console.log(err);
    }

    res.redirect("/");
 });


app.listen(port, () =>{
    console.log(`app is listening on ${port}`);
});
