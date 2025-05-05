const express = require('express');

const { body, param, validationResult } = require("express-validator");

const axios = require('axios');

const qs = require('qs');

const FormData = require('form-data');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

const baseUrl = process.env.BASE_URL;

const isAuth = require("../middleware/is_auth");

const getData = (url, method, data = null) => {
  let config = {
    method: method,
    maxBodyLength: Infinity,
    url: baseUrl + url,
    headers: {}
  };

  // Check if the method is POST and data is provided
  if (method.toLowerCase() === "post" && data) {
    config.data = qs.stringify(data, { arrayFormat: 'brackets' });
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  return config; // Always return the config object
};

router.get("/v1/home", async (req, res, next) => {
	try {
		const pgno = parseInt(req.query.pgno) || 1;

		let message = req.flash('error');
		// console.log(message);

		if (message.length > 0) {
			message = message;
		}
		else {
			message = null;
		}

    const response = await axios.request(
      getData("/api/v1/admin/home", "get")
    );

    // console.log(response.data);

    if (!response.data?.isSuccess) {
      return res.render("home1", {
        title: "Home",
        errorMessage: message,
        category: [],
        module: [],
        lesson: []
      })
    }

    else {
  		return res.render("home1", {
  			title: "Home",
  			errorMessage: message,
  			category: response.data?.cat_count,
        module: response.data?.module_count,
        lesson: response.data?.lesson_count
  		})
    }
	}

	catch(error) {
		console.log("get home error", error);

    req.flash("error", "Failed...");
    return res.redirect("/");
	}
})

router.get("/v1/category", isAuth, async (req, res, next) => {
	try {
		let message = req.flash("error");
    // console.log(message);

    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }

    const response = await axios.request(
      getData("/api/v1/admin/category", "get")
    );

    // console.log(response.data);

    if (!response.data.isSuccess) {
    	return req.flash("error", response.data.message);
    }

    else {
    	return res.render("showCat", {
	      title: "category",
	      editing: false,
	      errorMessage: message,
	      category: response.data?.data ? response.data?.data.filter(i => i.name !== "") : [],
	      category2: "",
	      id: "",
	      oldInput: {
	        name: "",
	      },
	      path: "category",
	    });
    }
	}

	catch(error) {
		console.log("Show Category error: ", error);
	}
})

router.get("/v1/category/:id", isAuth,
  [
    param("id")
      .trim()
      .notEmpty()
      .withMessage("Id is required")
      .isInt()
      .withMessage("Invalid Id found...")
  ], 
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const error = validationResult(req);

      if (!error.isEmpty()) {
        // console.log(error.array());
        const response = await axios.request(
          getData("/api/v1/admin/category", "get")
        );

        return res.render("showCat", {
          title: "category",
          editing: true,
          errorMessage: error.array()[0].msg,
          category: response.data?.data ? response.data?.data.filter(i => i.name !== "") : [],
          category2: "",
          id: id,
          oldInput: {
            name: name,
          },
          path: "category",
        });
      } 

      else {
        const [response, response1] = await Promise.all([
          axios.request(getData("/api/v1/admin/category", "get")),
          axios.request(getData(`/api/v1/admin/category/${id}`, "get"))
        ]);

        // console.log(response.data.data, response1.data.data);

        return res.render("showCat", {
          title: "category",
          editing: true,
          errorMessage: "",
          category: response.data !== "" ? response.data.data.filter(i => i.name !== "") : [],
          category2: response1.data !== "" ? response1.data.data[0].name : [],
          id: response1.data !== "" ? response1.data.data[0].id : '',
          oldInput: {
            name: "",
          },
          path: "category",
        })
      }
    } 

    catch (error) {
      console.log(error);
      req.flash("error", "Failed to update category. Try again...");
      return res.redirect("/v1/category");
    }
  }
);

router.post("/v1/addCat",
	[
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Category is required.")
      .isString()
      .withMessage("Category must be a string.")
      .matches(/^[A-Za-z\s]+$/)
      .withMessage("Category can only contain letters and spaces."),
  ],
  async (req, res, next) => {
    try {
      // console.log(req.body);

      const { name } = req.body;

      const error = validationResult(req);

      if (!error.isEmpty()) {
        // console.log(error.array());
        let msg1 = error.array()[0].msg;

        const response = await axios.request(
          getData("/api/v1/admin/category", "get")
        );

        return res.render("showCat", {
          title: "category",
          editing: false,
          errorMessage: msg1,
          category: response.data?.data ? response.data?.data.filter(i => i.name !== "") : [],
          category2: "",
          id: "",
          oldInput: {
            name: name,
          },
          path: "category",
        });
      } 

      else {
        const response2 = await axios.request(
          getData("/api/v1/admin/category", "post", { "name": name })
        );
        const data2 = response2.data;

        // console.log(data2);

        if (data2.isSuccess == true) {
          return res.redirect("/v1/category");
        } else {
          req.flash("error", "Failed... try again...");
          return res.redirect("/v1/category");
        }
      }
    } catch (error) {
      console.log("category error: ", error);
      return res.redirect("/v1/category");
    }
  }
)

router.post("/v1/editcat",
  [
    body("cid")
      .trim()
      .notEmpty()
      .withMessage("Id is required")
      .isInt()
      .withMessage("Invalid Id found..."),
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Category is required.")
      .isString()
      .withMessage("Category must be a string.")
      .matches(/^[A-Za-z\s]+$/)
      .withMessage("Category can only contain letters and spaces."),
  ], 
  async (req, res, next) => {
    try {
      const { cid, name } = req.body;
      // console.log(id, name);

      const error = validationResult(req);

      if (!error.isEmpty()) {
        // console.log(error.array());
        let msg1 = error.array()[0].msg;

        const response = await axios.request(
          getData("/api/v1/admin/category", "get")
        );
        // const data = response.data.data.length >= 1 ? response.data.data.filter(i => i != '') : '';

        return res.render("showCat", {
          title: "category",
          editing: true,
          errorMessage: msg1,
          category: response.data?.data ? response.data?.data.filter(i => i.name != '') : [],
          category2: name,
          id: cid,
          oldInput: {
            name: name,
          },
          path: "category",
        });
      } 

      else {
        const response2 = await axios.request(
        	getData(`/api/v1/admin/category/${cid}`, "post", { "name": name })
        );

        return res.redirect("/v1/category");
      }
    }

    catch (error) {
      console.log(error);
      req.flash("error", "Failed to update category. Try again...");
      return res.redirect("/v1/category");
    }
  }
);

router.get("/v1/delcat/:id", isAuth,
  [
    param("id")
      .trim()
      .notEmpty()
      .withMessage("Id is required")
      .isInt()
      .withMessage("Invalid Id found...")
  ], 
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const error = validationResult(req);

      if (!error.isEmpty()) {
        // console.log(error.array());
        let msg1 = error.array()[0].msg;

        const response = await axios.request(
          getData("/api/v1/admin/category", "get")
        );

        return res.render("showCat", {
          title: "category",
          editing: true,
          errorMessage: msg1,
          category: response.data?.data ? response.data.data.filter(i => i.name !== '') : [],
          category2: "",
          id: cid,
          oldInput: {
            name: name,
          },
          path: "category",
        });
      } 

      else {
        const response2 = await axios.request(
        	getData(`/api/v1/admin/categoryDelete/${id}`, "get")
        );

        // console.log(response2.data);

        if (!response2.data.isSuccess) {
        	return req.flash("error", response2.data.message);
        }

        else return res.redirect("/v1/category");
      }
    } 

    catch (error) {
      console.log(error);
      req.flash("error", "Failed to delete category. Try again...");
      return res.redirect("/v1/category");
    }
  }
);

router.get("/v1/modules", isAuth, async (req, res, next) => {
  try {
    const pgno = parseInt(req.query.pgno) || 1;

    // console.log(pgno);

    let message = req.flash('error');
    // console.log(message);

    if (message.length > 0) {
      message = message;
    }
    else {
      message = null;
    }

    const response = await axios.request(
      getData(`/api/v1/admin/modulesAll?page=${pgno}`, "get")
    );

    // console.log(response.data);

    if (!response.data?.isSuccess) {
      return res.render("modules", {
        title: "Modules",
        errorMessage: "",
        data: [],
        pgno: pgno,
        totalCount: ''
      })
    }

    else {
      return res.render("modules", {
        title: "Modules",
        errorMessage: "",
        data: response.data.data,
        pgno: pgno,
        totalCount: response.data?.totalCount
      })
    }
  }

  catch(error) {
    console.log("get modules error", error);

    req.flash("error", "Failed...");
    return res.redirect("/v1/home");
  }
})

router.get("/v1/add", isAuth, async (req, res, next) => {
	try {
		let message = req.flash('error');
		// console.log(message);

		if (message.length > 0) {
			message = message;
		}
		else {
			message = null;
		}

		const response = await axios.request(
      getData("/api/v1/admin/category", "get")
    );

		return res.render("add2", {
			title: "Add Modules",
			editing: false,
			errorMessage: message,
			category: response.data?.data ? response.data?.data.filter(i => i.name !== "") : [],
			oldInput: {
				title: '',
        description: '',
  			portrait_image: '',
  			fileCode: '',
  			video_length: '',
  			tag: '',
			},
		})
	}

	catch(error) {
		console.log("add movies get error", error);
	}
})

router.post("/v1/add",
	[
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Module Title is required.")
      .matches(/^[^<>]*$/)
      .withMessage("Invalid Module Title..."),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Module Description is required.")
      .matches(/^[^<>]*$/)
      .withMessage("Invalid Module Description..."),
    body("portrait_image").trim().notEmpty().withMessage("Image is required")
      .matches(/^(?:(?!<script).)*$/is).withMessage("Invalid Module Image found..."),
    body("fileCode").trim().notEmpty().withMessage("Video is required")
      .matches(/^(?:(?!<script).)*$/is).withMessage("Invalid Module Video found..."),
    body("video_length").trim().notEmpty().withMessage("Module Video is required")
      .isFloat({ min: 10, max: 300 }).withMessage("Invalid Module Duration found..."),
    body("tag").trim().notEmpty().withMessage("Category is required")
	],
	async (req, res, next) => {
		try {
			// console.log(req.body);

			const { portrait_image, fileCode, video_length, tag } = req.body;
      const title = req.body.title.trim();
      const description = req.body.description.trim();

			// console.log(title, portrait_image, fileCode);
			// console.log(typeof title, typeof portrait_image, typeof fileCode);

      const cleanedTags = typeof tag === "object"
        ? tag.filter(i => i !== "").map(tagId => parseInt(tagId.trim(), 10))
        : tag ? [parseInt(String(tag).trim(), 10)] : [];

			const error = validationResult(req);

	    if (!error.isEmpty()) {
				// console.log(error.array());

				const response = await axios.request(
		      getData("/api/v1/admin/category", "get")
		    );

				return res.render("add2", {
					title: "Add Modules",
					editing: false,
					errorMessage: error.array()[0].msg,
					category: response.data?.data ? response.data.data.filter(i => i.name !== "") : [],
					oldInput: {
						title: title,
            description: description,
		  			portrait_image: portrait_image,
		  			fileCode: fileCode,
		  			video_length: video_length,
		  			tag: cleanedTags
					}
				})
			}

			else {
				const response = await axios.request(
		      getData("/api/v1/admin/modules", "post", {
            "title": title,
            "description": description,
            "image": portrait_image,
            "video": fileCode,
            "duration": video_length,
            "category": cleanedTags.join(',')
          })
		    );

        // console.log(response.data);

		    if (response.data && !response.data.isSuccess) {
		    	req.flash("error", response.data.message);
		    	return res.redirect("/v1/add");
		    }

				else return res.redirect("/v1/modules");
			}
		}

		catch(error) {
			console.log("post add movie ", error);
      req.flash("error", "Failed to add modules...");
      return res.redirect("/v1/add");
		}
	}
)

router.get("/v1/add2", isAuth, async (req, res, next) => {
	try {
		// console.log(req.query);
		const { id } = req.query;

		// console.log(id);

		let message = req.flash('error');
		// console.log(message);

		if (message.length > 0) {
			message = message;
		}
		else {
			message = null;
		}

		return res.render("add3", {
			title: "Add Lessons",
			editing: false,
			errorMessage: message,
			oldInput: {
				id: id,
				title: [],
  			description: [],
  			portrait_image: [],
  			fileCode: [],
  			video_length: [],
			},
			count: 1
		})
	}

	catch(error) {
		console.log("add series get error", error);
	}
})

router.post("/v1/add2",
	[
	  body("id")
      .trim()
      .notEmpty()
      .isNumeric()
      .withMessage("Id is required")
      .custom(value => {
        if (value == 0) {
          throw new Error("Id is required");
        }
        return true; // indicate success
      }),

    body('title')
      .custom(value => {
        // Check if the value is either a string or an array
        if (typeof value === 'string') {
          if (value.trim() === '') {
            throw new Error('Episode Title must not be empty.');
          }
        } else if (Array.isArray(value)) {
          if (value.length === 0 || value.some(title => title.trim() === '')) {
            throw new Error('Episode Title must not be empty.');
          }
        } else {
          throw new Error('Episode Title must be a string or an array.');
        }
        return true;
      }),

    body('description')
      .custom(value => {
        if (typeof value === 'string') {
          if (value.trim() === '') {
            throw new Error('Episode Description must not be empty.');
          }
        } else if (Array.isArray(value)) {
          if (value.length === 0 || value.some(img => img.trim() === '')) {
            throw new Error('Episode Description must not be empty.');
          }
        } else {
          throw new Error('Episode Description must be a string or an array.');
        }
        return true;
        // if (!Array.isArray(value) || value.length === 0 || value.every(img => img.trim() === '')) {
        //   throw new Error('Episode Description must not be empty.');
        // }
        // return true;
      }),

    body('portrait_image')
      .custom(value => {
        if (typeof value === 'string') {
          if (value.trim() === '') {
            throw new Error('Episode Image must not be empty.');
          }
        } else if (Array.isArray(value)) {
          if (value.length === 0 || value.some(img => img.trim() === '')) {
            throw new Error('Episode Image must not be empty.');
          }
        } else {
          throw new Error('Episode Image must be a string or an array.');
        }
        return true;
        // if (!Array.isArray(value) || value.length === 0 || value.every(img => img.trim() === '')) {
        //   throw new Error('Episode Image must not be empty.');
        // }
        // return true;
      }),

    body('fileCode')
      .custom(value => {
        if (typeof value === 'string') {
          if (value.trim() === '') {
            throw new Error('Episode Video must not be empty.');
          }
        } else if (Array.isArray(value)) {
          if (value.length === 0 || value.some(img => img.trim() === '')) {
            throw new Error('Episode Video must not be empty.');
          }
        } else {
          throw new Error('Episode Video must be a string or an array.');
        }
        return true;
        // if (!Array.isArray(value) || value.length === 0 || value.every(img => img.trim() === '')) {
        //   throw new Error('Episode Video must not be empty.');
        // }
        // return true;
   	  }),

    body('video_length')
      .custom(value => {
        if (typeof value === 'string' && !isNaN(parseFloat(value))) {
            if (value <= 0) {
              throw new Error('Lesson duration must be a positive number.');
            }
          } else if (Array.isArray(value)) {
            // if (value.length === 0 || value.some(img => img.trim() === '')) {
            if (value.length === 0 || value.some(dur => {
              !isNaN(parseFloat(dur)) || dur <= 0 })) {
              throw new Error('All elements in Lesson duration array must be positive numbers.');
            }
          } else {
            throw new Error('Lesson duration must be a positive number or an array of positive numbers.');
          }
          return true;
        // if (!Array.isArray(value) || value.length === 0 || value.every(img => img.trim() === '')) {
        //   throw new Error('Episode Video length must not be empty.');
        // }
        // return true;
    	}),
	],
 	async (req, res, next) => {
		try {
			// console.log(req.body);

			const { id, title, description, portrait_image, fileCode, video_length } = req.body;

			// console.log(title, description, portrait_image, fileCode);
			// console.log(typeof title, typeof description, typeof logo, typeof portrait_image, typeof fileCode);

			const cleanedTitle = (typeof title == 'object') ? title.map(i => i.trim()) : [title.trim()];
			const cleanedDescription = (typeof description == 'object') ? description.map(i => i.trim()) : [description.trim()];
			const pi = (typeof portrait_image == 'object') ? portrait_image : [portrait_image];
			const fc = (typeof fileCode == 'object') ? fileCode : [fileCode];
			const vl = (typeof video_length == 'object') ? video_length : [video_length];

      // console.log(Math.max(cleanedTitle.length, cleanedDescription.length, pi.length, fc.length, vl.length));

      // console.log(cleanedTitle.length, cleanedDescription.length, pi.length, fc.length, vl.length);

			// console.log(cleanedTitle, cleanedDescription, pi, fc, vl, id);

			const error = validationResult(req);

	    if (!error.isEmpty()) {
				// console.log(error.array());

        // console.log(error.array()[0].msg);

				return res.render("add3", {
					title: "Add Lessons",
					editing: false,
					errorMessage: error.array()[0].msg,
					oldInput: {
						id: id,
						title: cleanedTitle,
		  			description: cleanedDescription,
		  			portrait_image: pi,
		  			fileCode: fc,
		  			video_length: vl
					},
          count: Math.max(cleanedTitle.length, cleanedDescription.length, pi.length, fc.length, vl.length)
				})
			}

			else {
				let data = JSON.stringify({
          "title": cleanedTitle,
            "description": cleanedDescription,
            "image": pi,
            "fileCode": fc,
            "duration": vl
        });

        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: baseUrl + `/api/v1/admin/moduleLessons/${id}`,
          headers: { 
            'Content-Type': 'application/json'
          },
          data : data
        };

        const response1 = await axios.request(config);

        const data1 = response1.data;

				// console.log(response1.data);

				if (data1 && data1.isSuccess == true) {
					return res.redirect("/v1/modules");
				}
				else {
					if (data1.hasOwnProperty('oldInput')) {
            return res.render("add3", {
              title: "Add Lessons",
              editing: false,
              errorMessage: data1?.message,
              oldInput: {
                id: data1?.id,
                title: data1.oldInput.title.split(","),
                description: data1.oldInput.description.split(","),
                portrait_image: data1.oldInput.image.split(","),
                fileCode: data1.oldInput.fileCode.split(","),
                video_length: data1.oldInput.duration.split(",")
              },
              count: Math.max(data1.oldInput.title.length, data1.oldInput.description.length, data1.oldInput.image.length, data1.oldInput.fileCode.length, data1.oldInput.duration.length)
            })
          }

          else {
            req.flash('error', "Failed to Add Lesson... Try Again...");
            return res.redirect(`/v1/add2/?id=${id}`);
          }
				}
			}
		}

		catch(error) {
			console.log("add lesson error ", error);
      req.flash('error', 'Failed to Add Lesson... Try Again...');
			return res.redirect("/v1/modules");
		}
	}
)

router.post("/v1/delete", async (req, res, next) => {
	try {
		// console.log(req.body.id);
		const { id } = req.body;

		const response1 = await axios.request(
      getData(`/api/v1/admin/moduleDelete/${id}`, "get")
    );
		const data1 = response1.data;
    
    if (data1.isSuccess) {
      return res.redirect("/v1/modules");
    }
    else {
      req.flash("error", "Failed to delete. Try again...");
		  return res.redirect("/v1/modules");
    }
	}

	catch(error) {
		req.flash('error', "Failed to delete... Try Again...");
		return res.redirect("/v1/home");
	}
})

router.get("/v1/edit/:id", isAuth, async (req, res, next) => {
	try {
		const { id } = req.params;

		// console.log(id);

		let message = req.flash('error');
		// console.log(message);

		if (message.length > 0) {
			message = message;
		}
		else {
			message = null;
		}

		const [response1, response2] = await Promise.all([
      axios.request(getData(`/api/v1/admin/modules/${id}`, "get")),
      axios.request(getData(`/api/v1/admin/category`, "get"))
    ])
		// const data1 = response1.data;

		console.log(response1.data);

    if (response1.data?.isSuccess && response2.data?.isSuccess) {
  		return res.render("add2", {
  			title: "Edit Movies",
  			editing: true,
  			errorMessage: message,
        category: response2.data?.data ? response2.data?.data.filter(i => i.name !== "") : [],
  			oldInput: {
  				title: response1.data?.data[0].title.trim(),
          description: response1.data?.data[0].description.trim(),
    			portrait_image: response1.data?.data[0].image,
    			fileCode: response1.data?.data[0].video,
    			video_length: response1.data?.data[0].duration,
    			tag: response1.data?.tags.map(i => i.id),
    			id: response1.data?.data[0].id
  			}
  		})
    }

    else {
      req.flash("error", "Failed...");
      return res.redirect("/v1/add");
    }
	}

	catch(error) {
		console.log("Edit Video error", error);
    req.flash("error", "Failed...");
    return res.redirect("/v1/home");
	}
})

router.post("/v1/edit",
	[
		body("title")
      .trim()
      .notEmpty()
      .withMessage("Module Title is required.")
      .matches(/^[^<>]*$/)
      .withMessage("Invalid Module Title..."),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Module Description is required.")
      .matches(/^[^<>]*$/)
      .withMessage("Invalid Module Description..."),
    body("portrait_image").trim().notEmpty().withMessage("Image is required")
      .matches(/^(?:(?!<script).)*$/is).withMessage("Invalid Module Image found..."),
    body("fileCode").trim().notEmpty().withMessage("Video is required")
      .matches(/^(?:(?!<script).)*$/is).withMessage("Invalid Module Video found..."),
    body("video_length").trim().notEmpty().withMessage("Module Video is required")
      .isFloat({ min: 10, max: 300 }).withMessage("Invalid Module Duration found..."),
    body("tag").trim().notEmpty().withMessage("Category is required"),
    body("id")
    	.trim()
	  	.notEmpty()
	  	.isNumeric() // Ensure it contains only numbers
    	.withMessage("Id must be a number."),
	],
 	async (req, res, next) => {
		try {
			// console.log(req.body);

			const { portrait_image, fileCode, video_length, tag, id } = req.body;

			const title = req.body.title.trim();
      const description = req.body.description.trim();

      // console.log(title, portrait_image, fileCode);
      // console.log(typeof title, typeof portrait_image, typeof fileCode);

      const cleanedTags = typeof tag === "object"
        ? tag.filter(i => i !== "").map(tagId => parseInt(tagId.trim(), 10))
        : tag ? [parseInt(String(tag).trim(), 10)] : [];

			const error = validationResult(req);

	    if (!error.isEmpty()) {
				// console.log(error.array());

        const response = await axios.request(
          getData("/api/v1/admin/category", "get")
        );

				return res.render("add2", {
					title: "Edit Module",
					editing: true,
					errorMessage: error.array()[0].msg,
          category: response.data?.data ? response.data.data.filter(i => i.name !== "") : [],
          oldInput: {
            title: title,
            description: description,
            portrait_image: portrait_image,
            fileCode: fileCode,
            video_length: video_length,
            tag: cleanedTags,
		  			id: id
					}
				})
			}

			else {
        const response = await axios.request(
          getData(`/api/v1/admin/modules/${id}`, "post", {
            "title": title,
            "description": description,
            "image": portrait_image,
            "video": fileCode,
            "duration": video_length,
            "category": cleanedTags.join(',')
          })
        );

        // console.log(response.data);

				if (response.data && response.data?.isSuccess == true) {
					return res.redirect("/v1/modules");
				}
				else {
					req.flash("error", response.data?.message);
					return res.redirect(`/v1/edit/${id}`);
				}
			}
		}

		catch(error) {
			console.log("Edit post error", error);
      req.flash("error", "Failed to update. Try Again...");
			return res.redirect(`/v1/modules`);
		}
	}
)

router.get("/v1/sedit/:mid", isAuth, async (req, res, next) => {
	try {
		let message = req.flash('error');
		// console.log(message);

		if (message.length > 0) {
			message = message;
		}
		else {
			message = null;
		}

		const { mid } = req.params;

		// console.log(mid);

		const response1 = await axios.request(
      getData(`/api/v1/admin/moduleLessons/${mid}`, "get")
    );
		const data1 = response1.data;

    // console.log(data1);

    if (data1 && data1.isSuccess) {
  		// const ep_title = data1.lessons.map(item => item.title !== "" ? item.title.trim() : "");
  		// const ep_description = data1.lessons.map(item => item.description !== "" ? item.description.trim() : "");
  		// const ep_image = data1.lessons.map(item => item.image !== "" ? item.image.trim() : "");
  		// const ep_video = data1.lessons.map(item => item.video !== "" ? item.video.trim() : "");
  		// const ep_videoLength = data1.lessons.map(item => item.video_length !== "" ? item.video_length : "");

      // console.log(ep_title, ep_description, ep_image, ep_video, ep_videoLength)

      // console.log(data1.lessons ? data1.lessons.map(item => item.title ? item.title.trim() : "") : []);

  		return res.render("add3", {
  			title: "Edit Lessons",
  			editing: true,
  			errorMessage: message,
  			oldInput: {
  				id: data1.lessons[0]?.module_id,
  				title: data1.lessons ? data1.lessons.map(item => item.title ? item.title.trim() : "") : [],
    			description: data1.lessons ? data1.lessons.map(item => item.description ? item.description.trim() : "") : [],
    			portrait_image: data1.lessons ? data1.lessons.map(item => item.image ? item.image.trim() : "") : [],
    			fileCode: data1.lessons ? data1.lessons.map(item => item.video ? item.video.trim() : "") : [],
    			video_length: data1.lessons ? data1.lessons.map(item => item.video_length ? item.video_length : "") : [],
  			},
  			count: data1.lessons.length
  		})
    }

    else {
      return res.render("add3", {
        title: "Edit Series",
        editing: true,
        errorMessage: message,
        oldInput: {
          id: mid,
          title: "",
          description: "",
          portrait_image: "",
          fileCode: "",
          video_length: ""
        },
        count: 0
      })
    }
	}

	catch(error) {
		console.log("Lessons Edit error", error);
		return res.redirect("/v1/modules");
	}
})

router.post("/v1/sedit",
	[
    body("id")
      .trim()
      .notEmpty()
      .isNumeric()
      .withMessage("Id is required")
      .custom(value => {
        if (value == 0) {
          throw new Error("Id is required");
        }
        return true; // indicate success
      }),

    body('title')
      .custom(value => {
        // Check if the value is either a string or an array
        if (typeof value === 'string') {
          if (value.trim() === '') {
            throw new Error('Episode Title must not be empty.');
          }
        } else if (Array.isArray(value)) {
          if (value.length === 0 || value.some(title => title.trim() === '')) {
            throw new Error('Episode Title must not be empty.');
          }
        } else {
          throw new Error('Episode Title must be a string or an array.');
        }
        return true;
      }),

    body('description')
      .custom(value => {
        if (typeof value === 'string') {
          if (value.trim() === '') {
            throw new Error('Episode Description must not be empty.');
          }
        } else if (Array.isArray(value)) {
          if (value.length === 0 || value.some(img => img.trim() === '')) {
            throw new Error('Episode Description must not be empty.');
          }
        } else {
          throw new Error('Episode Description must be a string or an array.');
        }
        return true;
        // if (!Array.isArray(value) || value.length === 0 || value.every(img => img.trim() === '')) {
        //   throw new Error('Episode Description must not be empty.');
        // }
        // return true;
      }),

    body('portrait_image')
      .custom(value => {
        if (typeof value === 'string') {
          if (value.trim() === '') {
            throw new Error('Episode Image must not be empty.');
          }
        } else if (Array.isArray(value)) {
          if (value.length === 0 || value.some(img => img.trim() === '')) {
            throw new Error('Episode Image must not be empty.');
          }
        } else {
          throw new Error('Episode Image must be a string or an array.');
        }
        return true;
        // if (!Array.isArray(value) || value.length === 0 || value.every(img => img.trim() === '')) {
        //   throw new Error('Episode Image must not be empty.');
        // }
        // return true;
      }),

    body('fileCode')
      .custom(value => {
        if (typeof value === 'string') {
          if (value.trim() === '') {
            throw new Error('Episode Video must not be empty.');
          }
        } else if (Array.isArray(value)) {
          if (value.length === 0 || value.some(img => img.trim() === '')) {
            throw new Error('Episode Video must not be empty.');
          }
        } else {
          throw new Error('Episode Video must be a string or an array.');
        }
        return true;
        // if (!Array.isArray(value) || value.length === 0 || value.every(img => img.trim() === '')) {
        //   throw new Error('Episode Video must not be empty.');
        // }
        // return true;
      }),

    body('video_length')
      .custom(value => {
        if (typeof value === 'string' && !isNaN(parseFloat(value))) {
          if (value <= 0) {
            throw new Error('Episode Video length must not be empty and a positive number.');
          }
        } else if (Array.isArray(value)) {
          // if (value.length === 0 || value.some(img => img.trim() === '')) {
          if (value.length === 0 || value.some(dur => {
            !isNaN(parseFloat(dur)) || dur <= 0 })) {
            throw new Error('Episode Video length must not be empty.');
          }
        } else {
          throw new Error('Episode Video length must be a number or an array.');
        }
        return true;
        // if (!Array.isArray(value) || value.length === 0 || value.every(img => img.trim() === '')) {
        //   throw new Error('Episode Video length must not be empty.');
        // }
        // return true;
      }),
  ],
 	async (req, res, next) => {
		try {
      // console.log(req.body);

      const { id, title, description, portrait_image, fileCode, video_length } = req.body;

      // console.log(title, description, portrait_image, fileCode);
      // console.log(typeof title, typeof description, typeof logo, typeof portrait_image, typeof fileCode);

      const cleanedTitle = (typeof title == 'object') ? title.map(i => i.trim()) : [title.trim()];
      const cleanedDescription = (typeof description == 'object') ? description.map(i => i.trim()) : [description.trim()];
      const pi = (typeof portrait_image == 'object') ? portrait_image : [portrait_image];
      const fc = (typeof fileCode == 'object') ? fileCode : [fileCode];
      const vl = (typeof video_length == 'object') ? video_length : [video_length];

      // console.log(Math.max(cleanedTitle.length, cleanedDescription.length, pi.length, fc.length, vl.length));

      // console.log(cleanedTitle.length, cleanedDescription.length, pi.length, fc.length, vl.length);

      // console.log(cleanedTitle, cleanedDescription, pi, fc, vl, id);

      const error = validationResult(req);

      if (!error.isEmpty()) {
        // console.log(error.array());

        // console.log(error.array()[0].msg);

        return res.render("add3", {
          title: "Add Lessons",
          editing: true,
          errorMessage: error.array()[0].msg,
          oldInput: {
            id: id,
            title: cleanedTitle,
            description: cleanedDescription,
            portrait_image: pi,
            fileCode: fc,
            video_length: vl
          },
          count: Math.max(cleanedTitle.length, cleanedDescription.length, pi.length, fc.length, vl.length)
        })
      }

      else {
        let data = JSON.stringify({
          "title": cleanedTitle,
            "description": cleanedDescription,
            "image": pi,
            "fileCode": fc,
            "duration": vl
        });

        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: baseUrl + `/api/v1/admin/moduleLessons/${id}`,
          headers: { 
            'Content-Type': 'application/json'
          },
          data : data
        };

        const response1 = await axios.request(config);

        const data1 = response1.data;

        // console.log(response1.data);

        if (data1 && data1.isSuccess == true) {
          return res.redirect("/v1/modules");
        }
        else {
          if (data1.hasOwnProperty('oldInput')) {
            return res.render("add3", {
              title: "Edit Lessons",
              editing: true,
              errorMessage: data1?.message,
              oldInput: {
                id: data1?.id,
                title: data1.oldInput.title.split(","),
                description: data1.oldInput.description.split(","),
                portrait_image: data1.oldInput.image.split(","),
                fileCode: data1.oldInput.fileCode.split(","),
                video_length: data1.oldInput.duration.split(",")
              },
              count: Math.max(data1.oldInput.title.length, data1.oldInput.description.length, data1.oldInput.image.length, data1.oldInput.fileCode.length, data1.oldInput.duration.length)
            })
          }

          else {
            req.flash('error', "Failed to Add Lesson... Try Again...");
            return res.redirect(`/v1/sedit/${id}`);
          }
        }
      }
    }

		catch(error) {
			console.log("post edit lessons error: ", error);
			return res.redirect("/v1/modules");
		}
	}
)

router.get("/v1/trending", isAuth, async (req, res, next) => {
  try {
    let message = req.flash('error');
    // console.log(message);

    if (message.length > 0) {
      message = message;
    }
    else {
      message = null;
    }

    const response1 = await axios.request(
      getData("/api/v1/admin/trending", "get")
    );

    if (response1.data && response1.data.isSuccess) {
      return res.render("trending", {
        title: "Trending",
        errorMessage: "",
        data: response1.data.data
      })
    }

    else {
      return res.render("trending", {
        title: "Trending",
        errorMessage: "",
        data: []
      })
    }
  }

  catch(error) {
    console.log("Get trending error: ", error);
    return res.redirect("/v1/home");
  }
})

router.post("/v1/trending",
  [
    body("id")
      .trim()
      .notEmpty()
      .isNumeric()
      .withMessage("Module is required")
      .custom(value => {
        if (value == 0) {
          throw new Error("Module is required");
        }
        return true; // indicate success
      }),
  ],
  async (req, res, next) => {
    try {
      const { id } = req.body;

      // console.log(id);

      const error = validationResult(req);

      if (!error.isEmpty()) {
        // console.log(error.array());
        req.flash("error", error.array()[0].msg);
        return res.redirect("/v1/modules");
      }

      else {
        const response = await axios.request(
          getData("/api/v1/admin/trending", "post", {
            "module_id": id
          })
        );

        // console.log(response.data);

        if (response.data && response.data?.isSuccess) {
          return res.redirect("/v1/trending");
        }

        else {
          req.flash("error", "Failed to add module to trending... Try Again...");
          return res.redirect("/v1/modules");
        }
      }
    }

    catch (error) {
      console.log("post add trending error: ", error);
      return res.redirect("/v1/trending");
    } 
  }
)

router.post("/v1/deleteTrending",
  [
    body("id")
      .trim()
      .notEmpty()
      .isNumeric()
      .withMessage("ID is required")
      .custom(value => {
        if (value == 0) {
          throw new Error("ID is required");
        }
        return true; // indicate success
      }),
  ], 
  async (req, res, next) => {
    try {
      const { id } = req.body;

      // console.log(id);

      const error = validationResult(req);

      if (!error.isEmpty()) {
        // console.log(error.array());
        req.flash("error", error.array()[0].msg);
        return res.redirect("/v1/trending");
      }

      else {
    		const response1 = await axios.request(
          getData(`/api/v1/admin/trendingDelete/${id}`, "get")
        );
    		// const data1 = response1.data;
        
        if (response1.data && response1.data?.isSuccess) {
          return res.redirect("/v1/trending");
        }
        
        else {
          req.flash("error", "Failed to delete trending. Try again...");
          return res.redirect("/v1/trending");
        }
      }
    }
    
    catch(error) {
      console.log("delete trending error: ", error);
      return res.redirect("/v1/trending");
    }
  }
)

module.exports = router;