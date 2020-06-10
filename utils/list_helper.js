const dummy = (blogs) => {
	return 1;
};

const totalLikes = (blogs) => {
	const reducer = (sum, post) => {
		return sum + post.likes;
	};

	return blogs.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
	const reducer = (favorite, current) => {
		return favorite.likes > current.likes ? favorite : current; 
	};

	const mostLikes = blogs.reduce(reducer);

	const formattedBlogpost = {
		title: mostLikes.title, 
		author: mostLikes.author,
		likes: mostLikes.likes 
	};

	return formattedBlogpost;
};

const mostBlogs = (blogs) => {
	const statistics = countBlogs(blogs);
	const most = statistics.reduce((highest, current) => highest.blogs > current.blogs ? highest : current);
	return most;
};

const countBlogs = (blogs) => {
	let statistics = [];

	blogs.forEach( (blog) => {
		if (statistics.some(statistic => statistic.author === blog.author)){
			const target = statistics.find((counter) => counter.author === blog.author);
			target.blogs += 1;
		} else {
			statistics.push({
				author: blog.author, 
				blogs: 1
			});
		}
	});

	return statistics;
};

const mostLikes = (blogs) => {
	const statistics = countLikes(blogs);
	const highestLikes = statistics.reduce((highest, current) => highest.likes > current.likes ? highest : current);
	return highestLikes;
};

const countLikes = (blogs) => {
	let statistics = [];

	blogs.forEach( (blog) => {
		if (statistics.some((statistic) => statistic.author === blog.author)){
			const target = statistics.find((statistic) => statistic.author === blog.author);
			target.likes += blog.likes;
		} else {
			statistics.push({
				author: blog.author,
				likes: blog.likes, 
			});
		}
	});
	return statistics;
};

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes };