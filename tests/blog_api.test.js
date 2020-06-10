const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");
const api = supertest(app);
const Blog = require("../models/blog");

beforeEach(async () => {
	await Blog.deleteMany({});

	let blogObject = new Blog(helper.initialBlogs[0]);
	await blogObject.save();

	blogObject = new Blog(helper.initialBlogs[1]);
	await blogObject.save();
});

describe("retrieving blog posts", () => {
	test("blogs are returned as json", async () => {
		await api 
			.get("/api/blogs")
			.expect(200)
			.expect("Content-Type", /application\/json/);	
	});
	
	test("blog document/record has an id property", async () => {
		const response = await api.get("/api/blogs");
		expect(response.body[0].id).toBeDefined();
	});
});

describe("addition of a new blog post", () => {
	test("a valid blog post can be added", async () => {
		const newBlog = {
			title: "Nur der SVW",
			author: "Mule",
			url: "www.worum.org",
			likes: 1899,
		};
	
		await api
			.post("/api/blogs")
			.send(newBlog)
			.expect(201)
			.expect("Content-Type", /application\/json/);
	
		const response = await api.get("/api/blogs");
		const titles = response.body.map((blog) => blog.title);
	
		expect(response.body).toHaveLength(helper.initialBlogs.length + 1);
		expect(titles).toContain("Nur der SVW");
	});
	
	test("likes defaults to 0 if it is missing from the request", async () => {
		const newBlog = {
			title: "Bambule",
			author: "Mule",
			url: "www.worum.org",
		};
	
		await api 
			.post("/api/blogs")
			.send(newBlog)
			.expect(201)
			.expect("Content-Type", /application\/json/);
		/*
		const response = await api.get("/api/blogs");
		expect(response.body[response.body.length - 1].likes).toBe(0);
		*/
		const blogsAtEnd = await helper.blogsInDb();
		expect(blogsAtEnd[blogsAtEnd.length - 1].likes).toBe(0);

	});
	
	test("blog without title is not added", async () => {
		const newBlog = {
			author: "Mule",
			url: "www.worum.org",
		};
	
		await api
			.post("/api/blogs")
			.send(newBlog)
			.expect(400);
	
		const blogsAtEnd = await helper.blogsInDb();
		expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
	});
	
	test("blog without author is not added", async () => {
		const newBlog = {
			title: "Werder Bremen allez",
			url: "www.worum.org",
		};
	
		await api
			.post("/api/blogs")
			.send(newBlog)
			.expect(400);
	
		const blogsAtEnd = await helper.blogsInDb();
		expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
	});
});

describe("deletion of a blog post", () => {
	test("succeeds with status code 204 if id is valid", async () => {
		const blogsAtStart = await helper.blogsInDb();
		const blogToDelete = blogsAtStart[0];

		await api 
			.delete(`/api/blogs/${blogToDelete.id}`)
			.expect(204);
		
		const blogsAtEnd = await helper.blogsInDb();
		expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);

		const titles = blogsAtEnd.map((r) => r.title);
		expect(titles).not.toContain(blogToDelete.title);
	});
});

describe("updating a blog post", () => {
	test("succeeds when updating a blog post", async () => {
		const blogsAtStart = await helper.blogsInDb();
		const blogToUpdate = blogsAtStart[0];
		
		const updatedBlog = {
			title: "Grün und weiß, das ist unser Team, Werder Brem' wir wollen dich siegen sehen",
			author: "Mule",
			url: "www.werder.de",
			likes: 32,
		};

		await api
			.put(`/api/blogs/${blogToUpdate.id}`)
			.send(updatedBlog)
			.expect(200);

		const blogsAtEnd = await helper.blogsInDb();
		expect(blogsAtStart).toHaveLength(helper.initialBlogs.length);

		const titles = blogsAtEnd.map((r) => r.title);
		expect(titles).toContain(updatedBlog.title);
	});
});

afterAll(() => {
	mongoose.connection.close();
});