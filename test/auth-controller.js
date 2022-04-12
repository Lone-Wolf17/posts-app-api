const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");
const mongoose = require("mongoose");

const AuthController = require("../controllers/auth.js");
const User = require("../models/user.js");

chai.use(chaiAsPromised);

describe("Auth Controller", function (done) {
  before(function (done) {
    mongoose
      .connect(
        "mongodb+srv://wolf234:wolf432@cluster0.uube4.mongodb.net/test-messages?retryWrites=true&w=majority"
      )
      .then((client) => {
        console.log("DB Connected!");
        const user = new User({
          email: "test@test.com",
          password: "tester",
          name: "Test",
          posts: [],
          _id: "5c0f66b979af55031b34728a",
        });
        return user.save();
      })
      .then(() => {
        done();
      });
  });
  
  it("should throw an error with code 500 if accessing the database fails", function (done) {
    sinon.stub(User, "findOne");
    User.findOne.throws();

    const req = {
      body: {
        email: "test@test.com",
        password: "tester",
      },
    };

    AuthController.login(req, {}, () => {}).then((result) => {
      chai.expect(result).to.be.an("error");
      chai.expect(result).to.have.property("statusCode", 500);
      done();
    });

    console.log("Pont");

    // AuthController.login(req, {}, () => {}).should.eventually.have.property(
    //   "statusCode"
    // );

    User.findOne.restore();
  });

  it("should send a response with a valid user status for an existing user", function (done) {
    const req = { userId: "5c0f66b979af55031b34728a" };
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.userStatus = data.status;
      },
    };
    AuthController.getUserStatus(req, res, () => {}).then(() => {
      chai.expect(res.statusCode).to.be.equal(200);
      chai.expect(res.userStatus).to.be.equal("I am new!");
      done();
    });
    });
    after(function (done) {
        User.deleteMany({})
          .then(() => {
            return mongoose.disconnect();
          })
          .then(() => {
            done();
          });
  });
});
