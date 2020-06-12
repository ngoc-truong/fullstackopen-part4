const Blog = require("../models/blog");
const User = require("../models/user");

const initialBlogs = [
	{
		title: "Mammasita, Senjorita",
		author: "Ngoc Truong",
		url: "www.google.de",
		likes: 32
	},
	{
		title: "Europapaaaark",
		author: "Anna Ihln", 
		url: "www.facebook.de",
		likes: 0
	},
];

const blogsInDb = async () => {
	const blogs = await Blog.find({});
	return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
	const users = await User.find({});
	return users.map((user) => user.toJSON());
};

module.exports = { initialBlogs, blogsInDb, usersInDb };