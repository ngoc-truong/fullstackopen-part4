const mongoose = require("mongoose");

const mongoUrl = process.env.MONGODB_URI;
console.log("Connecting to", mongoUrl);

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(result => {
		console.log("Connecting to MongoDB");
	})
	.catch(error => {
		console.log("Error connecting to MongoDB:", error.message);
	});

const blogSchema = new mongoose.Schema({
	title: String, 
	author: String, 
	url: String, 
	likes: Number 
});

blogSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
	}
});

module.exports = mongoose.model("Blog", blogSchema);