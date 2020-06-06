const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

// Get all blogs
blogsRouter.get("/", (request, response) => {
	Blog.find({})
		.then(blogs => {
			response.json(blogs.map(blog => blog.toJSON()));
		});
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
blogsRouter.post("/", (request, response, next) => {
	const blog = new Blog(request.body);

	blog.save()
		.then(result => {
			response
				.status(201)
				.json(result);
		});
});

module.exports = blogsRouter;