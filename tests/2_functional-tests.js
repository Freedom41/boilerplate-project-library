
var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
var id1;
chai.use(chaiHttp);

suite('Functional Tests', function () {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function (done) {
    chai.request(server)
      .get('/api/books')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  }).timeout(5000)
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function () {

    suite('POST /api/books with title => create book object/expect book object', function () {

      test('Test POST /api/books with title', function (done) {

        chai.request(server)
          .post('/api/books')
          .send({
            title: "The Valley"
          })
          .end((err, res) => {
            let id = res.body._id
            assert.exists(res.body)
            assert.property(res.body, '_id')
            assert.property(res.body, 'title')
            chai.request(server)
              .delete('/api/books/' + id)
              .send({ _id: id })
              .end((err, res) => {
                assert.equal(res.text, 'delete successful')
              })
            done();
          })

      }).timeout(5000)

      test('Test POST /api/books with no title given', function (done) {
        chai.request(server)
          .post('/api/books')
          .send({
            title: ""
          })
          .end((err, res) => {
            assert.equal(res.text, 'Please enter title')
            done();
          })
      });
    });


    suite('GET /api/books => array of books', function () {

      test('Test GET /api/books', function (done) {
        chai.request(server)
          .get('/api/books')
          .end((err, res) => {
            id1 = res.body[0]._id;
            assert.isArray(res.body, 'should be an array')
            done();
          })

      }).timeout(5000)

    });


    suite('GET /api/books/[id] => book object with [id]', function () {

      test('Test GET /api/books/[id] with id not in db', function (done) {
        let id = '5db87bde93847841e5f0762e'
        chai.request(server)
          .get('/api/books/' + id)
          .end((err, res) => {
            assert.equal(res.text, 'no book exists')
            done();
          })

      });

      test('Test GET /api/books/[id] with valid id in db', function (done) {
        chai.request(server)
          .get('/api/books/' + id1)
          .end((err, res) => {
            assert.equal(res.body._id, id1)
            done();
          })

      });

    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function () {

      test('Test POST /api/books/[id] with comment', function (done) {
        chai.request(server)
          .post('/api/books/' + id1)
          .send({
            comment: "ok"
          })
          .end((err, res) => {
            assert.equal(res.body._id, id1)
            done();
          })
      });
    });
  });
});