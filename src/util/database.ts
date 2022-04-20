import mongoose, { ConnectOptions } from "mongoose";

// let _db;

export const mongoConnect = (callback: Function) => {
  mongoose
    .connect(process.env.MONGO_URI!, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      autoIndex: true
    } as ConnectOptions)
    .then((client) => {
      console.log("Connected!");
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

// const getDb = () => {
//   if (_db) {
//     return _db;
//   }
//   throw "No database found!";
// };
// exports.getDb = getDb;
