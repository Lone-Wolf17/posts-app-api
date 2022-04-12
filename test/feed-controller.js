const expect = require("chai").expect;
const mongoose = require("mongoose");

const FeedController = require("../controllers/feedsController.js");
const User = require("../models/user.js");
const Post = require("../models/post.js");

describe("Feed Controller", function (done) {
  before(function (done) {
    mongoose
      .connect(process.env.MONGO_TEST_URI)
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

  it("should add a created post to the posts of the creator", function (done) {
    const req = {
      body: {
        title: "Test Post",
        content: "A Test Post",
      },
      file: {
        path: "abc",
      },
      userId: "5c0f66b979af55031b34728a",
    };
    const res = {
      status: function () {},
      json: function () {
        return this;
      },
    };
    FeedController.createPost(req, res, () => {}).then((savedUser) => {
      expect(savedUser).to.be.property("posts");
      expect(savedUser).to.be.length(1);
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
