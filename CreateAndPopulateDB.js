const userBooksModel = require('./models/userBooks');
const BooksModel = require('./models/book');
const AuthorModel = require('./models/author');
const CategoryModel = require('./models/category');
const userModel = require('./models/user');
const AdminModel = require('./models/admin');


//comment the next line
AdminModel.create({ name: "admin", username: "admin", password: "1234_abc%AVC" });