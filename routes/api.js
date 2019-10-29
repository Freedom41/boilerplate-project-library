'use strict';

var expect = require('chai').expect;
const dotenv = require('dotenv').config();
const MONGO = process.env.DB;
const mongoose = require("mongoose");

mongoose.connect(MONGO, { useNewUrlParser: true, poolSize: 4, useUnifiedTopology: true, useFindAndModify: false })
  .then(() => {
    console.log("connected")
  },
    (err) => {
      console.log(err)
    }
  )

const bookSchema = mongoose.Schema({
  title: String,
  comments: [String],
  comment_count: { type: Number, default: 0 }
})

var Book = mongoose.model('Book', bookSchema)

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res) {

      let bk = await Book.find((err, docs) => {
        if (err) {
          console.log(err)
        } else {
          let display = [];
          docs.map((doc) => {
            display.push({
              "_id": doc.id,
              "title": doc.title,
              "commentcount": doc.comment_count,
              "comments": doc.comments
            })
          })
          res.json(display)
        }
      });
    })

    .post(async function (req, res) {
      var title = req.body.title;
      if (title.trim() == "") {
        res.send("Please enter title")
      } else {
        var book = new Book({ "title": title });
        var addBook = await Book.findOne({ title: title }, async (err, docs) => {
          if (docs != null) {
            res.json("book already present")
          } else {
            let bk = await book.save();
            res.send(bk)
          }
        })
      }
    })

    .delete(async function (req, res) {
      let bk = await Book.deleteMany((error) => {
        if (error) {
          console.log(error)
        } else {
          res.json('complete delete successful')
        }
      })

    });

  app.route('/api/books/:id')
    .get(function (req, res) {
      var bookid = mongoose.Types.ObjectId(req.params.id);
      let bk = Book.findById(bookid, (err, docs) => {
        if (err) {
          res.send(err)
        } else {
          if (docs == null) {
            res.send('no book exists')
          } else {
            res.json({
              _id: docs._id,
              title: docs.title,
              comments: docs.comments
            })
          }
        }
      })
    })

    .post(async function (req, res) {

      var bookid = mongoose.Types.ObjectId(req.params.id);
      var comment = req.body.comment;
      let comment_count = 1;
      let count = await Book.findById(bookid, async (err, docs) => {
        if (err) {
          console.log(err)
        } else {
          if (docs == null) {
            res.json("book unavaliable")
          }
          let commentcount = docs.comments.length + 1;
          let bk = await Book.findByIdAndUpdate(
            bookid, { "$push": { comments: comment }, "$set": { comment_count: commentcount } }, { new: true }, (err, docs) => {
              if (err) {
                console.log(err)
              } else {
                res.json({
                  _id: docs._id,
                  "title": docs.title,
                  "comments": docs.comments
                })
              }
            })
        }
      })
    })

    .delete(function (req, res) {

      var bookid = mongoose.Types.ObjectId(req.params.id);
      let bk = Book.deleteOne({ _id: bookid }, (err, docs) => {
        if (docs == null) {
          res.json("id not found in database")
        } else {
          res.send("delete successful")
        }
      })
    });
};
