globalThis.document.addEventListener("DOMContentLoaded", function() {
	setTimeout(function() {
        const alertElement = document.querySelector('.alert-danger');
        if (alertElement) {
            alertElement.style.display = 'none';
        }
    }, 3000);

	const add_more_btn = globalThis.document.querySelector('.add_more_btn');
	const heading1 = globalThis.document.querySelector('.heading1');
	const partOneTemplate = globalThis.document.getElementById('part_one_template');
	const submitButton = globalThis.document.getElementById('subBtn');

	const oldInput = JSON.parse(dataArray.replace(/&#34;/g, '"'));

	// console.log(Array.isArray(oldInput.description), oldInput.description);

	// console.log(oldInput);

	if (oldInput.id == undefined) {
    window.location.href = '/v1/home'; // Redirect to the root path
  }

	let xhrInstances = {};

	// const initialEpisodes = 1;

	// console.log(Number(count));

	let episodeCount = Number(count);

	function createEpisodeSection(index) {
		// console.log(index);

		const div = document.createElement('div');
        div.className = 'mt-3';
        div.id = `episode_${index}`;

		div.innerHTML = `
		    <!-- add new -->
		    <div class="mb-3 pt-1 pb-1 pe-2 ps-2 d-flex justify-content-between align-items-center bg-dark" style="border-radius: 10px;">
		    	<div class="text-white ep_index_id" style="font-weight: bold;">Episode ${index}</div>
		    	<div class="text-white">
		    		<button type="button" class="btn delete_ep_button" data-del-id="${index}">
						<i class="fa-solid fa-trash" style="color: red;"></i>
					</button>
		    	</div>
		    </div>

			<!-- title -->
			<div class="mb-3">
				<label for="exampleInputTitle_${index}" class="form-label">Title</label>
				<input 
					type="text" 
					class="form-control" 
					id="exampleInputTitle_${index}" 
					name="title" 
					placeholder="e.g., The Avengers"
					value="${(oldInput.title && oldInput.title[index-1]) || ''}"
				>
			</div>

			<!-- description -->
			<div class="mb-3">
				<label for="exampleFormControlTextarea_${index}" class="form-label">Description</label>
				<textarea 
					class="form-control desc" 
					id="exampleFormControlTextarea_${index}" 
					name="description" 
					rows="3"
          style="white-space: nowrap; padding: 0.5rem; margin: 0;"
				>
					${oldInput.description && oldInput.description[index - 1] !== undefined ? oldInput.description[index-1].replace(/[\t\n\r]/g, '').trim() : ''}
				</textarea>
			</div>

			<!-- portrait image -->
			<div class="mb-3" id="portrait_div_${index}">
				<div style="display: none;">
				    <label for="formFilep_${index}" class="form-label">Image</label>
				    <div>
				    	<img src="" class="img-thumbnail" alt="..." width="300" height="300" id="portImg" loading="lazy">
				    </div>
				</div>
				<div>
				    <label for="formFile_${index}" class="form-label">Image</label>
				    <input class="form-control" type="file" id="formFileP_${index}" accept="image/*">
				    <input type="hidden" name="portrait_image" id="formNameFileP_${index}" value="${(oldInput.portrait_image && oldInput.portrait_image[index-1]) || ''}">
				</div>
				<div class="col-12 col-sm-12 col-md-12 col-lg-2 d-flex align-items-center justify-content-between">
				    <button type="button" class="btn upload-Pimage-btn border-0" data-p-id="${index}">
				        <i class="fa-solid fa-cloud-arrow-up"></i>
				    </button>
	    			<button type="button" class="btn delete-P-button" data-p-id="${index}">
				        <i class="fa-solid fa-trash" style="color: red;"></i>
				    </button>
				    <div id="spinner_subP_${index}" class="spinner-border" role="status" style="display: none;">
				        <span class="sr-only">Loading...</span>
				    </div>
				</div>
			</div>

			<!-- video -->
			<div class="mb-3" id="v_div_${index}">
				<div class="col-12">
					<label for="videoFor_${index}" class="form-label">Video</label>
				</div>
				<div id="up_vid_div_${index}" style="display: none;">UPLOADED</div>
				<div class="col-12 col-sm-6 col-md-8 col-lg-5 border text-sm-center p-0" id="embed-responsive_${index}" style="display: none;">
					<div class="embed-responsive embed-responsive-16by9">
					  	<video 
							src=""
							id="videoDiv_${index}" 
							class="videoDiv object-fit-contain" controls autoplay muted name="media">
					  	</video>
					</div>
				</div>

				<div class="col-12 col-sm-6 col-md-8 col-lg-5 video-uploader" id="video-uploader_${index}">
				    <label class="file-label" for="movieFile_${index}" id="fileLabel">
				      <i class="fa-solid fa-file-video"></i> Choose Video
				    </label>
				    <input type="file" id="movieFile_${index}" class="file-input" accept="video/*">
				    <input type="hidden" class="border-0" id="episode_Id" value="">
				    <input type="hidden" id="fileCode_${index}" name="fileCode" class="custom-file-input" value="${(oldInput.fileCode && oldInput.fileCode[index-1]) || ''}">
				    <span id="file_name_${index}" name="file_name" class="file-name">No file chosen</span>
				</div>
				<div class="col-12 col-sm-6 col-md-4 col-lg-5 text-start d-flex justify-content-between align-items-center" style="word-wrap: break-word;">
				    <p class="text-break"></p>
				</div>
				<div class="col-12 col-sm-12 col-md-12 col-lg-2 d-flex justify-content-between">
				    <div id="spinner_${index}" class="spinner-border" role="status" style="display: none;">
				      <span class="sr-only">Loading...</span>
				    </div>
				    <button type="button" class="btn upload-button border-0" data-v-id="${index}">
				      <i class="fa-solid fa-cloud-arrow-up"></i>
				    </button>
	    			<button type="button" class="btn delete-button" data-v-id="${index}">
						<i class="fa-solid fa-trash" style="color: red;"></i>
					</button>
				    <!-- Subtitle Button -->
				    <button type="button" class="btn subtitle-button border-0 d-none" data-tvshow-id="">
				      <i class="fa-solid fa-closed-captioning"></i>
				    </button>
				</div>
			</div>

			<div id="progress-container_${index}" style="display: none;">
				<label for="upload-progress">Upload Progress:</label>
				<progress id="upload-progress_${index}" value="0" max="100"></progress>
				<span id="progress-text_${index}">0%</span>
			</div>

			<input 
				type="hidden" 
				name="video_length" 
				id="video_length_${index}"
				value="${(oldInput.video_length && oldInput.video_length[index-1]) || ''}" 
			/>

			<div class="mb-3">
				<button 
					type="button" 
					class="btn btn-outline-success add_below" 
					data-ab-id="${index}"
				>
					+ADD
				</button>
			</div>
		`;
        return div;
    }

    for (let i = 1; i <= episodeCount; i++) {
        const episodeSection = createEpisodeSection(i);
        partOneTemplate.appendChild(episodeSection);
    }


    add_more_btn.addEventListener('click', function (event) {
	    episodeCount++;
	    const episodeSection = createEpisodeSection(episodeCount);
	    partOneTemplate.appendChild(episodeSection);
	    if (heading1) heading1.style.display = 'none';
		});

		const textareas = document.querySelectorAll('textarea');

    // Loop through each textarea and trim leading/trailing spaces
    textareas.forEach(function(textarea) {
      // Trim the content of each textarea and set it back
      textarea.value = textarea.innerHTML.trim();
    });

	partOneTemplate.addEventListener('click', function(e) {
		// console.log(e.target);

		if (e.target && e.target.parentElement.classList.contains('delete_ep_button')) {
			const delEpBtn = e.target.parentElement;
			// console.log(delEpBtn);

	        // Get the episode ID from the button's data attribute
	        const delId = delEpBtn.getAttribute('data-del-id');
	        
	        // Find the corresponding episode section to remove
	        const episodeSection = document.querySelector(`#episode_${delId}`);
	        
	        // Remove the episode section from the DOM if it exists
	        if (episodeSection) {
	            episodeSection.remove();

	            rearrangeEpisodes();
	        }
	    }

	    else if (e.target && e.target.classList.contains('add_below')) {
			const addBelow = e.target;

	    	const epId = addBelow.getAttribute('data-ab-id');

	    	// console.log(epId);

	    	episodeCount++;
	    	const episodeSection = createEpisodeSection(episodeCount);

	    	const currentEpisodeSection = document.querySelector(`#episode_${epId}`);

	    	// console.log(currentEpisodeSection);

	    	if (currentEpisodeSection) {
            	currentEpisodeSection.insertAdjacentElement('afterend', episodeSection);

            	rearrangeEpisodes();
        	}
	    }
    
      else if (e.target && e.target.classList.contains('desc')) {
        // console.log(e.target);
        e.target.addEventListener('input', function() {
          this.value = this.value.replace(/[\t\n\r]/g, ''); // Removes new lines
        });
      }

	    else if (e.target && e.target.parentElement.classList.contains('upload-limage-btn')) {
	    	const btn = e.target.parentElement;

	    	const btnId = btn.getAttribute('data-logo-id');

	    	// console.log(btn, btnId);

	    	// uploadLogoImage(btn, btnId);
	    }

	    else if (e.target && e.target.parentElement.classList.contains('upload-Pimage-btn')) {
	    	const btn = e.target.parentElement;

	    	const btnId = btn.getAttribute('data-p-id');

	    	// console.log(btn, btnId);

	    	uploadPortraitImage(btn, btnId);
	    }

	    else if (e.target && e.target.parentElement.classList.contains('upload-button')) {
	    	const btn = e.target.parentElement;

	    	const btnId = btn.getAttribute('data-v-id');

	    	// console.log(btn, btnId);

	    	uploadVideo(btn, btnId);
	    }

	    else if (e.target && e.target.parentElement.classList.contains('delete-P-button')) {
	    	const btn = e.target.parentElement;

	    	const btnId = btn.getAttribute('data-p-id');

	    	// console.log(btn, btnId);

	    	deletePortraitImage(btn, btnId);
	    }

	    else if (e.target && e.target.parentElement.classList.contains('delete-button')) {
	    	const btn = e.target.parentElement;

	    	const btnId = btn.getAttribute('data-v-id');

	    	// console.log(btn, btnId);

	    	deleteVideo(btn, btnId);
	    }

	    else if (e.target && e.target.classList.contains('file-input')) {
	    	const fileInput = e.target;
		    const fileNameDisplay = fileInput.nextElementSibling.nextElementSibling.nextElementSibling; // The third sibling is the file-name span

		    // console.log(fileInput, fileNameDisplay);

		    const file = fileInput.files[0];
		    // console.log(file);
		    if (file) {
		      fileNameDisplay.textContent = file.name;
		    } else {
		      fileNameDisplay.textContent = "No file chosen";
		    }
	    }
	});

	function rearrangeEpisodes() {
		const allEpisodes = document.querySelectorAll('.ep_index_id');

	    // console.log(allEpisodes);

	    allEpisodes.forEach((ep, index) => {
	    	const newIndex = index + 1;
	    	ep.textContent = `Episode ${newIndex}`;
	    })
	}

	document.addEventListener("change", function (event) {
		if (event.target.matches(".file-input")) {
		    const fileInput = event.target;
		    const fileNameDisplay = fileInput.nextElementSibling.nextElementSibling.nextElementSibling; // The third sibling is the file-name span

		    // console.log(fileInput, fileNameDisplay);

		    const file = fileInput.files[0];
		    // console.log(file);
		    if (file) {
		      fileNameDisplay.textContent = file.name;
		    } else {
		      fileNameDisplay.textContent = "No file chosen";
		    }
		}
	});

	function uploadPortraitImage(btn, id) {
		// console.log("portrait image", btn, id);

		submitButton.style.display = 'none';
		btn.disabled = true;

		const formFile1 = globalThis.document.getElementById(`formFileP_${id}`);

		const file = formFile1.files[0];

		// console.log(formFile1, file);

		if (formFile1.files.length === 0) {
		    alert('Please select a image to upload.');
		    btn.disabled = false;
		    submitButton.style.display = 'block';
		    return;
		}

		else if (file) {
		 	submitButton.style.display = 'block';
		    // console.log(file.name);
		    function isVideoExtension(extension) {
		      	const videoExtensions = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"];
		      	return videoExtensions.includes(extension.toLowerCase());
		    }
		    const extension = file.name.match(/\.([^\.]+)$/);

		    if (extension) {
		        const extractedExtension = extension[1].toLowerCase(); // Convert to lowercase for case-insensitive comparison
		        const isVideo = isVideoExtension("." + extractedExtension); // Add dot prefix
		        // console.log(isVideo);
		        if (!isVideo) {
		            alert('Please select a image to upload.');
		            btn.disabled = false;
		            // const fileNameDisplay = fileInput.nextElementSibling.nextElementSibling.nextElementSibling; // The third sibling is the file-name span
		            formFile1.value = "";
		            return;
		        }
		    } else {
		      console.log("No extension found");
		    }
		}

		submitButton.style.display = 'none';

		const spinner = document.getElementById(`spinner_subP_${id}`);
		spinner.style.display = 'block';

		const formdata = new FormData();
		formdata.append("fileToUpload", file);

		const requestOptions = {
		    method: "POST",
		    body: formdata,
		    redirect: "follow"
		};

		fetch("https://api.edugarciamovimiento.com/fitness/uploadImage.php", requestOptions)
		    .then((response) => response.json())
		    .then((result) => {
		        // console.log(result);
		        if (result.isSuccess == true) {
		            spinner.style.display = 'none';
		            btn.parentElement.style.display = 'none';
		            globalThis.document.getElementById(`formNameFileP_${id}`).value = result.image;
		            btn.parentElement.previousElementSibling.style.display = 'none';
		            const showDiv = btn.parentElement.previousElementSibling.previousElementSibling;

					     	const port_img = showDiv.querySelector("#portImg");

					     	port_img.setAttribute("src", `https://api.edugarciamovimiento.com/fitness/uploads/${result.image}`);

					     	showDiv.style.display = 'block';

		            btn.parentElement.previousElementSibling.previousElementSibling.style.display = 'block';
		            btn.parentElement.parentElement.style.marginBottom = '50px';
		            submitButton.style.display = 'block';

		            const formdata2 = new FormData();
                    formdata2.append("img_url", `https://api.edugarciamovimiento.com/fitness/uploads/${result.image}`);
                    formdata2.append("width", "1200");
                    formdata2.append("height", "630");

                    const requestOptions = {
                      method: "POST",
                      body: formdata2,
                      redirect: "follow"
                    };

                    fetch("https://api.edugarciamovimiento.com/fitness/ufi.php", requestOptions)
                      .then((response) => response.json())
                      .then((result) => {
                        //console.log(result);
                        spinner.style.display = 'none';
                      })
                      .catch((error) => {
                        console.error(error);
                        return;
                      });
		        }
		        else {
		            alert(result.errorMsg);
		            btn.disabled = false;
		            file.value = '';
		            spinner.style.display = 'none';
		            return;
		        }
		    })
		    .catch((error) => console.error(error));
    }

    function uploadVideo(btn, id) {
	    submitButton.style.display = 'none';
	    btn.disabled = true;

	    const videoIframe = document.querySelector(`#embed-responsive_${id}`);
	    const fileInput = document.querySelector(`#movieFile_${id}`);
	    const videoUploader = document.querySelector(`#video-uploader_${id}`);
	    const progressContainer = document.getElementById(`progress-container_${id}`);
	    const progressBar = document.getElementById(`upload-progress_${id}`);
	    const progressText = document.getElementById(`progress-text_${id}`);
	    const up_vid_div = document.getElementById(`up_vid_div_${id}`);

	    videoIframe.style.display = "none"; 

	    const file = fileInput.files[0];
      
      // console.log(file);

	    if (fileInput.files.length === 0) {
	        alert('Please select a video to upload.');
	        btn.disabled = false;
	        submitButton.style.display = 'block';
	        return;
	    }

	    const isVideoExtension = (extension) => {
	        const videoExtensions = [".mp4", ".avi", ".wmv", ".mov", ".mkv", ".flv", ".webm", ".3gp", ".ogv", ".mpeg", ".mpg", ".divx", ".vob"];
	        return videoExtensions.includes(extension.toLowerCase());
	    };
	    
	    const extension = file.name.match(/\.([^\.]+)$/);
	    if (extension) {
	        const extractedExtension = extension[1].toLowerCase(); // Convert to lowercase for case-insensitive comparison
	        if (!isVideoExtension("." + extractedExtension)) {
	            alert('Please select a video to upload.');
	            btn.disabled = false;
	            fileInput.nextElementSibling.nextElementSibling.nextElementSibling.textContent = "No file chosen";
	            return;
	        }
	    }
      
      const video = document.createElement('video'); // Create a temporary video element
        
        // Create a URL for the video file and set it as the source for the video element
        const url = URL.createObjectURL(file);
        video.src = url;

        // Wait for the video's metadata (duration) to load
        video.onloadedmetadata = function() {
            const duration = Math.floor(video.duration); // Get the video duration in seconds
          
            // console.log(duration);
            document.getElementById(`video_length_${id}`).value = duration;
            // document.getElementById('videoDuration').textContent = `Video duration: ${duration.toFixed(2)} seconds`;
        };

	    submitButton.style.display = 'none';
	    const fCode = document.getElementById(`fileCode_${id}`);
	    const spinner = document.getElementById(`spinner_${id}`);
	    spinner.style.display = 'block';

	    const formdata = new FormData();
	    formdata.append("video", file);

	    // Create a new XHR instance for this upload
	    const xhr = new XMLHttpRequest();
	    xhrInstances[id] = xhr; // Store the XHR instance with the ID

	    xhr.upload.addEventListener('progress', (event) => {
	        if (event.lengthComputable) {
	            const percentComplete = Math.round((event.loaded / event.total) * 100);
	            progressBar.value = percentComplete;
	            progressText.textContent = `${percentComplete}%`;
	            progressContainer.style.display = 'block';
	        }
	    });

	    xhr.addEventListener('load', () => {
	        progressContainer.style.display = 'none';
	        if (xhr.status === 200) {
	            const result = JSON.parse(xhr.responseText);
	            if (result.isSuccess) {
	                const filecode = result.video;
	                fCode.value = filecode;
	                spinner.style.display = 'none';
	                if (filecode) {
	                    videoUploader.style.display = 'none';
	                    up_vid_div.style.display = "block";
	                    submitButton.style.display = 'block';
	                    btn.disabled = false;
	                    setTimeout(() => {
	                        up_vid_div.style.display = "none";
	                        videoIframe.style.display = "block";
	                        const videoTag = document.getElementById(`videoDiv_${id}`);
	                        videoTag.setAttribute('src', `https://api.edugarciamovimiento.com/fitness/uploads/${filecode}`);
	                        videoTag.load();
	                        // videoTag.addEventListener('loadedmetadata', () => {
	                        //     const duration = videoTag.duration;
	                        //     document.getElementById(`video_length_${id}`).value = duration;
	                        // });
	                    }, 1000);
	                } else {
	                    alert(`Unable to upload ${file.name}.`);
	                    fileInput.nextElementSibling.nextElementSibling.nextElementSibling.textContent = "No file chosen";
	                    submitButton.style.display = 'none';
	                    spinner.style.display = 'none';
	                    btn.disabled = false;
	                }
	            } else {
	                alert(`Unable to upload ${file.name}.`);
	                fileInput.nextElementSibling.nextElementSibling.nextElementSibling.textContent = "No file chosen";
	                btn.disabled = false;
	                spinner.style.display = 'none';
	            }
	        }
	    });

	    xhr.addEventListener('error', () => {
	        alert('An error occurred while uploading the video.');
	        btn.disabled = false;
	        spinner.style.display = 'none';
	    });

	    xhr.open('POST', 'https://api.edugarciamovimiento.com/fitness/uploadVideo.php', true);
	    xhr.send(formdata);
	}

	if (oldInput.portrait_image != '') {
		oldInput.portrait_image.forEach((i, index) => {
			const portDiv = globalThis.document.getElementById(`portrait_div_${index+1}`);

			// console.log(portDiv);

	        // logoDiv.style.marginTop = '50px';
	        // logoDiv.style.border = '2px solid red';
	        const firstDiv = portDiv.querySelectorAll('div')[0];
			const secondDiv = portDiv.querySelectorAll('div')[2];
			const thirdDiv = portDiv.querySelectorAll('div')[3];

			const button = thirdDiv.querySelector('i.fa-cloud-arrow-up').parentElement;
			const port_img = firstDiv.querySelector("#portImg");

			// console.log(firstDiv, secondDiv);
			// console.log(thirdDiv, button);
			//console.log(logo_img);

			port_img.setAttribute("src", `https://api.edugarciamovimiento.com/fitness/uploads/${i}`);

			if (i != '') {
				firstDiv.style.display = 'block';
				secondDiv.style.display = 'none';
				button.disabled = true;
			}
			else {
				firstDiv.style.display = 'none';
				secondDiv.style.display = 'block';
				button.disabled = false;
			}
		})
    }

    if (oldInput.fileCode !== '') {
    	oldInput.fileCode.forEach((i, index) => {
         	// console.log(i);

         	const videoDiv = globalThis.document.getElementById(`v_div_${index+1}`);
            const vu1 = globalThis.document.getElementById(`video-uploader_${index+1}`);
            const er1 = globalThis.document.getElementById(`embed-responsive_${index+1}`);
         		
         	vu1.style.display = 'none';
            er1.style.display = 'block';

            // console.log(vu1, er1);

           	//console.log(videoDiv.querySelectorAll('div')[6],videoDiv.querySelectorAll('div')[6].querySelector('.upload-button'));

           	const thirdVideoDiv = videoDiv.querySelectorAll('div')[6].querySelector('.upload-button');

           	//console.log(thirdVideoDiv);

			const videoTag = er1.querySelector('.videoDiv');
			if (i != '') {
          		vu1.style.display = 'none';
				thirdVideoDiv.disabled = true;
          	}
          	else {
          		er1.style.display = 'none';
          		vu1.style.display = 'block';
				thirdVideoDiv.disabled = false;
          	}

          	videoTag.setAttribute('src', `https://api.edugarciamovimiento.com/fitness/uploads/${i}`);
        })
    }

    function deletePortraitImage(btn, id) {
    	// console.log("delete portrait button", btn, id);

    	globalThis.document.getElementById(`formFileP_${id}`).value = '';
		globalThis.document.getElementById(`formNameFileP_${id}`).value = '';
		btn.previousElementSibling.style.display = 'block';
		btn.previousElementSibling.disabled = false;
		btn.parentElement.previousElementSibling.style.display = 'block';
		btn.parentElement.previousElementSibling.previousElementSibling.style.display = 'none';
    }

	function deleteVideo(btn, id) {
		// console.log("delete video", btn, id);

		try {
		    // console.log(btn);
            btn.previousElementSibling.disabled = false;

		    // console.log(btn.parentElement.previousElementSibling.previousElementSibling);
		    document.getElementById(`video_length_${id}`).value = '';

		    // console.log(xhr);

			if (xhrInstances[id]) {
            	xhrInstances[id].abort(); // Abort the ongoing XHR request for this specific video
            	delete xhrInstances[id];
				alert('Upload cancelled.');

				const progressContainer = document.getElementById(`progress-container_${id}`);
				const progressBar = document.getElementById(`upload-progress_${id}`);
				const progressText = document.getElementById(`progress-text_${id}`);
				progressBar.value = 0;
				progressText.textContent = '0%';
				progressContainer.style.display = 'none';

				const spinner = document.getElementById(`spinner_${id}`);
				spinner.style.display = 'none';

				const fileInput = document.querySelector(`#movieFile_${id}`);
				const fileNameDisplay = fileInput.nextElementSibling.nextElementSibling.nextElementSibling;
				fileNameDisplay.textContent = "No file chosen";

				submitButton.style.display = 'block';
				btn.disabled = false;
			}

		    const videoIframe = document.querySelector(`#embed-responsive_${id}`);
		    const uploadButton = btn.previousElementSibling;
		    const videoUploader = document.querySelector(`#video-uploader_${id}`);

		    const iframeElement = document.querySelector(`.videoDiv_${id}`);
		    // console.log(iframeElement.getAttribute("src"));
		    const iUrl = iframeElement ? iframeElement.getAttribute("src") : '';
                
            const fileName = document.getElementById(`file_name_${id}`);
		    fileName.textContent = 'No file chosen';
                
            document.getElementById(`fileCode_${id}`).value = '';

		    // console.log(btn.parentElement.nextElementSibling);

		    // console.log(document.getElementById(`fileCode_${id}`));
                
            // console.log(videoIframe, uploadButton, videoUploader);

		    // console.log(iUrl, iUrl !== '');

		    if (iUrl !== '') {
		    	// console.log("iurl");

		      	const fCode = document.getElementById(`fileCode_${id}`).value;

		       	// console.log(fCode);

		        videoIframe.style.display = 'none';
		        videoUploader.style.display = 'block';

		        document.getElementById(`fileCode_${id}`).value = '';

		        // console.log(uploadButton);
		        uploadButton.disabled = false;

		        const fileName = document.getElementById(`file_name_${id}`);
		        fileName.textContent = 'No file chosen';

		        submitButton.style.display = 'block';

		        const spinner = document.getElementById(`spinner_${id}`);
				spinner.style.display = 'none';
		    }

		    else {
		      // uploadButton.disabled = true;
		      // btn.disabled = true;
		      // submitButton.style.display = 'none';
		      videoUploader.style.display = 'block';
		      videoIframe.style.display = 'none';
		    }
		}

		catch (error) {
		    // Handle any errors that occur during data retrieval or video deletion
		    console.log('Error:', error);
		}
	}
})