const express = require('express');

const { body, validationResult } = require("express-validator");

const axios = require('axios');

const qs = require('qs');

// const FormData = require('form-data');

const crypto = require("crypto");

// const jwt = require("jsonwebtoken");

const router = express.Router();

const baseUrl = process.env.BASE_URL;

// console.log(baseUrl);

// const { axiosInstance } = require('../config/axios-config');

const getData = (url, method, data = null) => {
  let config = {
    method: method,
    maxBodyLength: Infinity,
    url: baseUrl + url,
    headers: {}
  };

  if (method.toLowerCase() === "post" && data) {
  	console.log(data);

    config.data = qs.stringify(data, { arrayFormat: 'brackets' });
    config.headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    }

    return config;
  }

  else return config;
};

router.get("/", async (req, res, next) => {
	try {
		let message = req.flash('error');
		// console.log(message);

		if (message.length > 0) {
			message = message[0].message;
		}
		else {
			message = null;
		}

		return res.render("login", {
			title: 'Login',
			errorMessage: message,
			oldInput: {
				email: 'annu@cat.in'
			}
		})
	}

	catch(error) {
		console.log("login error", error);
	}
})

router.post("/",
	[
	  body("email")
      .trim()
      .notEmpty()
      .withMessage("Email Address required")
      .normalizeEmail()
      .isEmail()
      .withMessage("Invalid email"),
	  body("password")
	    .trim()
	    .notEmpty()
	    .withMessage("Password required")
	    .matches(/^[^<>]*$/)
	    .withMessage("White space not allowed")
  ],
 	async (req, res, next) => {
		const { email, password } = req.body;
		// console.log(req.body);

    try {
      const error = validationResult(req);

	    if (!error.isEmpty()) {
				// console.log(error.array());
				let msg1 = error.array()[0].msg;

				return res.render("login", {
					title: 'Login',
					errorMessage: msg1,
					oldInput: {
						email: email
					}
				})
			}

			else {
				const response = await axios.request(
					getData("/api/v1/auth/login", "post", { "email": email, "password": password })
				)

				// console.log(response);

				if (!response.data?.isSuccess) {
					return res.redirect("/");
				}

				else {
					res.cookie("_fitness_isLoggedIn", true);
					return res.redirect("/v1/home");
				}
			}
		}

		catch(error) {
			return res.redirect("/");
		}
	}
)

router.get("/logout", async (req, res, next) => {
	// const postData2 = { 'q1': `DELETE from hSession where email = '${req.session.name}'` };
	// const response2 = await axios.request(selectUrl('post', postData2));

		// const xx = await axios.request(
		// 	getData("/api/v1/logout", "get")
		// );

    res.clearCookie("_fitness_isLoggedIn", {
      sameSite: "None",
      httpOnly: true, // Prevents JavaScript access to the cookie
      secure: true // Use secure cookies in production
    });

    return res.redirect("/");
});

module.exports = router;