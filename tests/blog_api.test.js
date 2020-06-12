const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");
const api = supertest(app);
const Blog = require("../models/blog");
const User = require("../models/user");

beforeEach(async () => {
	// Populate DB with blogs
	await Blog.deleteMany({});
	const blogObjects = helper.initialBlogs
		.map((blog) => new Blog(blog));
	const promiseArray = blogObjects.map((blog) => blog.save());
	await Promise.all(promiseArray);

	// Populate DB with one user
	await User.deleteMany({});
	const passwordHash = await bcrypt.hash("sekret", 10);
	const user = new User({ username: "root", passwordHash });
	await user.save();
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
	let token;

	// Login user and save token
	beforeEach(async () => {
		const user = {
			username: "hansi",
			name: "Hans Meiser",
			password: "password",
		};

		await api
			.post("/api/users")
			.send(user);

		const result = await api
			.post("/api/login")
			.send(user);

		token = result.body.token; 
	});

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
			.set({ "Authorization": `bearer ${token}` })
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
			.set({ "Authorization": `bearer ${token}`})
			.expect(201)
			.expect("Content-Type", /application\/json/);

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
			.set({ "Authorization": `bearer ${token}` })
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
			.set({ "Authorization": `bearer ${token}` })
			.expect(400);
	
		const blogsAtEnd = await helper.blogsInDb();
		expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
	});

	test("blog without token is not added", async () => {
		const newBlog = {
			title: "Muhhhh",
			url: "www.muh.de",
		};

		await api
			.post("/api/blogs")
			.send(newBlog)
			.expect(401)
			.expect("Content-Type", /application\/json/);
	});
});

describe("deletion of a blog post", () => {
	let token;

	// Login user and save token
	beforeEach(async () => {
		const user = {
			username: "hansi",
			name: "Hans Meiser",
			password: "password",
		};

		await api
			.post("/api/users")
			.send(user);

		const result = await api
			.post("/api/login")
			.send(user);

		token = result.body.token; 
	});

	test("succeeds with status code 204 if id is valid", async () => {
		const blogsAtStart = await helper.blogsInDb();
		const blogToDelete = blogsAtStart[0];

		await api
			.delete(`/api/blogs/${blogToDelete.id}`)
			.set({ "Authorization": `bearer ${token}` })
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

describe("when there is initially one user in db", () => {
	test("creation succeeds with a fresh username", async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			username: "Ngoc",
			name: "Ngoc Truong",
			password: "password",
		};

		await api
			.post("/api/users")
			.send(newUser)
			.expect(200)
			.expect("Content-Type", /application\/json/);

		const usersAtEnd = await helper.usersInDb();
		expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

		const usernames = usersAtEnd.map((user) => user.username);
		expect(usernames).toContain(newUser.username);
	});

	test("creation fails with proper statuscode and message if username already taken", async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			username: "root",
			name: "Superuser",
			password: "password",
		};

		const result = await api
			.post("/api/users")
			.send(newUser)
			.expect(400)
			.expect("Content-Type", /application\/json/);
		
		expect(result.body.error).toContain("`username` to be unique");

		const usersAtEnd = await helper.usersInDb();
		expect(usersAtEnd).toHaveLength(usersAtStart.length);
	});

	test("creation fails if password not given", async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			username: "Mamma",
			name: "Magical Mamma"
		};

		const result = await api
			.post("/api/users")
			.send(newUser)
			.expect(400)
			.expect("Content-Type", /application\/json/);
		
		expect(result.body.error).toContain("No password given.");

		const usersAtEnd = await helper.usersInDb();
		expect(usersAtEnd).toHaveLength(usersAtStart.length);
	});

	test("creation fails if password is too short", async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			name: "Mustafa",
			password: "pa"
		};

		const result = await api
			.post("/api/users")
			.send(newUser)
			.expect(400)
			.expect("Content-Type", /application\/json/);
		
		expect(result.body.error).toContain("Password is too short");
		
		const usersAtEnd = await helper.usersInDb();
		expect(usersAtEnd).toHaveLength(usersAtStart.length);
	});

	test("creation fails if username not given", async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			name: "Mustafa",
			password: "password"
		};

		const result = await api
			.post("/api/users")
			.send(newUser)
			.expect(400)
			.expect("Content-Type", /application\/json/);
		
		expect(result.body.error).toContain("`username` is required");
		
		const usersAtEnd = await helper.usersInDb();
		expect(usersAtEnd).toHaveLength(usersAtStart.length);
	});

	test("creation fails if username is too short", async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			username: "m",
			name: "Mustafa",
			password: "password"
		};

		const result = await api
			.post("/api/users")
			.send(newUser)
			.expect(400)
			.expect("Content-Type", /application\/json/);
		
		expect(result.body.error).toContain("is shorter than the minimum allowed length (3)");
		
		const usersAtEnd = await helper.usersInDb();
		expect(usersAtEnd).toHaveLength(usersAtStart.length);
	});

});

afterAll(() => {
	mongoose.connection.close();
});