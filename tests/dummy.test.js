const listHelper = require("../utils/list_helper");

test("dummy returns one", () => {
	const blogs = [];

	const result = listHelper.dummy(blogs);
	expect(result).toBe(1);
});

describe("total likes", () => {
	const blogList = [
		{
			_id: "5a422a851b54a676234d17f7", 
			title: "React patterns", 
			author: "Michael Chan", 
			url: "https://reactpatterns.com/", 
			likes: 7, 
			__v: 0 
		},
		{
			_id: "5a422aa71b54a676234d17f8", 
			title: "Go To Statement Considered Harmful", 
			author: "Edsger W. Dijkstra", 
			url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html", 
			likes: 5, 
			__v: 0
		},
		{
			_id: "5a422b3a1b54a676234d17f9", 
			title: "Canonical string reduction", 
			author: "Edsger W. Dijkstra", 
			url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html", 
			likes: 12, 
			__v: 0
		},
		{
			_id: "5a422b891b54a676234d17fa", 
			title: "First class tests", 
			author: "Robert C. Martin", 
			url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll", 
			likes: 10, 
			__v: 0	
		},
		{
			_id: "5a422ba71b54a676234d17fb", 
			title: "TDD harms architecture", 
			author: "Robert C. Martin", 
			url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html", 
			likes: 0, 
			__v: 0
		},
		{
			_id: "5a422b3a1b54a676234d17f9", 
			title: "Mister Aufziehvogel", 
			author: "Edsger W. Dijkstra", 
			url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html", 
			likes: 0, 
			__v: 0
		},
	];

	const listWithOneBlog = [
		{
			_id: "5a422aa71b54a676234d17f9",
			title: "Go To Statement Considered Harmful",
			author: "Edsger W. Dijkstra",
			url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
			likes: 5,
			__v: 0
		}
	];

	test("when list has only one blog equals the likes of that", () => {
		const result = listHelper.totalLikes(listWithOneBlog);
		expect(result).toBe(5);
	});

	test("returns total likes of several blog posts", () => {
		const result = listHelper.totalLikes(blogList);
		expect(result).toBe(34);
	});

	test("Returns the post with most likes", () => {
		const mostLikedPost = {
			title: "Canonical string reduction", 
			author: "Edsger W. Dijkstra", 
			likes: 12, 
		};

		const result = listHelper.favoriteBlog(blogList);
		expect(result).toEqual(mostLikedPost);
	});

	test("Returns the author with highest number of blogs", () => {
		const authorWithHighestBlogNumber = {
			author: "Edsger W. Dijkstra",
			blogs: 3
		};
		const result = listHelper.mostBlogs(blogList);
		expect(result).toEqual(authorWithHighestBlogNumber);
	});

	test("Returns author with highest aggregated number of likes", () => {
		const authorWithHighestLikes = {
			author: "Edsger W. Dijkstra",
			likes: 17
		};
		const result = listHelper.mostLikes(blogList);
		expect(result).toEqual(authorWithHighestLikes);
	});
});