const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const axios = require("axios");
const app = express();

dotenv.config();
const PORT = process.env.PORT;
const API_CONFIG = {
	_clientId: process.env.CLIENT_Id,
	_clientSecret: process.env.CLIENT_SECRET,
};

app.use("/static", express.static("static"));
app.use(bodyParser.json());

app.get("/", (_, res) => {
	res.sendFile(__dirname + "/static/index.html");
});

app.post("/api/translation", (req, res) => {
	const { source, target, text } = req.body;
	axios
		.post(
			"https://openapi.naver.com/v1/papago/n2mt",
			{ source, target, text },
			{
				headers: {
					"X-Naver-Client-Id": API_CONFIG._clientId,
					"X-Naver-Client-Secret": API_CONFIG._clientSecret,
				},
			}
		)
		.then((response) => {
			res.json({ isSuccess: true, result: response.data.message.result });
		})
		.catch((error) => {
			res
				.status(error.response.status)
				.json({ isSuccess: false, message: error.response.data.errorMessage });
		});
});

app.listen(PORT, () => {
	console.log(`✅ Server Listen : http://localhost:${PORT}`);
});
