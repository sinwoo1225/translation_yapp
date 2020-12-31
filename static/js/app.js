window.SpeechRecognition =
	window.SpeechRecognition || window.webkitSpeechRecognition;

const App = {
	_resultBox: document.querySelector("#result"),
	_textInput: document.querySelector("#textInput"),
	_translationBtn: document.querySelector("#translationBtn"),
	_recordBtn: document.querySelector("#recordBtn"),
	_recognition: new SpeechRecognition(),
	init() {
		this._recognition.interimResults = true;
		this._recognition.lang = "ko-KR";
		this._recognition.continuous = false;
		this._recognition.maxAlternatives = 20000;

		this._translationBtn.addEventListener("click", (event) => {
			event.preventDefault();
			this.requestTranslation();
		});
		this._recordBtn.addEventListener("click", (event) => {
			event.preventDefault();
			this._resultBox.innerText = "⏱ 음성인식 시작";
			this._recognition.start();
		});
		this._recognition.addEventListener("end", () => {
			console.log("end");
			if (!this._recognition.result) {
				this._resultBox.innerText =
					"😥 음성인식에 실패했습니다. 다시 시도해주세요.";
			} else {
				this._recognition.result = null;
				this._resultBox.innerText = "";
			}
		});
		this._recognition.addEventListener("speechstart", () => {
			this._resultBox.innerText = "⏳ 음성인식중 ...";
		});
		this._recognition.addEventListener("result", (event) => {
			if (event.results[0].isFinal) {
				this._recognition.result = event.results[0][0].transcript;
				this._textInput.value = this._recognition.result;
			}
		});
	},
	requestTranslation() {
		const text = this._textInput.value;

		// input validation
		if (text.length <= 0) {
			this._resultBox.innerText = "❗ 번역할 문장을 올바르게 입력해주세요.";
			return;
		}
		RequestHttp.post(
			"/api/translation",
			{
				source: "ko",
				target: "en",
				text,
			},
			{
				"Content-Type": "application/json; charset=UTF-8",
			}
		)
			.then((response) => {
				console.log(response);
				this._resultBox.innerText = response.result.translatedText;
			})
			.catch((error) => {
				console.log(error);
			});
	},
};

const RequestHttp = {
	requestAsAjax(url, method, body, header) {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.addEventListener("load", () => {
				if (xhr.status === 200) {
					resolve(JSON.parse(xhr.responseText));
				} else {
					reject(new Error(JSON.parse(xhr.responseText).message));
				}
			});
			xhr.open(method, url);

			// 헤더설정
			if (header) {
				for (key in header) {
					xhr.setRequestHeader(key, header[key]);
				}
			}

			xhr.send(JSON.stringify(body));
		});
	},
	get(url, header) {
		return this.requestAsAjax(url, "GET", null, header);
	},
	post(url, body, header) {
		return this.requestAsAjax(url, "POST", body, header);
	},
};

window.addEventListener("DOMContentLoaded", () => {
	App.init();
});
