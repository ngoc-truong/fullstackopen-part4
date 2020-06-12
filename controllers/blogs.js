const blogsRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const Blog = require("../models/blog");
const User = require("../models/user");

// Get all blogs
blogsRouter.get("/", async (request, response) => {
	const blogs = await Blog
		.find({})
		.populate("user", { username: 1, name: 1 });

	response.json(blogs.map(blog => blog.toJSON()));
});

// Get specific blog
blogsRouter.get("/:id", (request, response, next) => {
	Blog.findById(request.params.id)
		.then(blog => {
			if (blog) {
				response.json(blog.toJSON());
			} else {
				response.status(404).end();
			}
		})
		.catch(error => next(error));
});

// Post a new blog
blogsRouter.post("/", async (request, response, next) => {
	if (!request.body.likes){
		request.body.likes = 0;
	}

	const body = request.body; 
	const token = request.token;
	const decodedToken = jwt.verify(token, process.env.SECRET);
	if (!token || !decodedToken.id) {
		return response.status(401).json({ error: "token missing or invalid" });
	}
	const user = await User.findById(decodedToken.id);

	const blog = new Blog({
		title: body.title,
		author: body.author, 
		url: body.url,
		likes: body.likes,
		user: user._id,
	});

	try {
		const savedBlog =  await blog.save();
		user.blogs = user.blogs.concat(savedBlog._id);
		await user.save();
		response.status(201).json(savedBlog.toJSON());
	} catch (exception) {
		next(exception);
	}
});

// Delete a blog post
blogsRouter.delete("/:id", async (request, response, next) => {
	const token = request.token;
	const decodedToken = jwt.verify(token, process.env.SECRET);

	if (!token || !decodedToken.id){
		return response.status(401).json({ error: "token missing or invalid" });
	}

	const user = await User.findById(decodedToken.id);
	const blog = await Blog.findById(request.params.id);

	try {
		if (user._id.toString() === blog.user.toString()) {
			await blog.remove();
			response.status(204).end();
		} else {
			response.status(401).json({ error: "wrong token" });
		}
	} catch (exception) {
		next(exception);
	}
});

// Updating a blog post
blogsRouter.put("/:id", async (request, response, next) => {
	const body = request.body;

	const blog = {
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes, 
	};

	try {
		const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true });
		response.json(updatedBlog.toJSON());
	} catch (exception) {
		next(exception);
	}
});

module.exports = blogsRouter;