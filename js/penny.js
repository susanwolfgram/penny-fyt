var app = angular.module("myApp", ["firebase"]);
//¢
app.controller("myCtrl", function ($scope, $firebaseObject, $firebaseArray, $firebaseAuth, $interval) {
	var user;
	var userObj;
	var userIdNum;
	var npoObj;
	$scope.loggedIn = false;
	$scope.about = true;
	$scope.showSignup = false;
	$scope.discover = false;
	$scope.feed = false;
	$scope.reload = false;
	$scope.demographics = false;
	$scope.demographicsNA = false;
	$scope.demoReq = false;
	$scope.userProfile = false;
	$scope.profileImageUpload = false;
	$scope.npoAbout = false;
	$scope.results = false;

	$scope.stepOne = true;
	$scope.stepTwo = false;
	$scope.stepThree = false;
	$scope.stepFour = false;
	$scope.stepFive = false;
	var userRef = firebase.database().ref().child("users");
	// create a synchronized array
	$scope.users = $firebaseArray(userRef);
	$scope.signup = function () {
		if ($scope.pwd && $scope.pwd.length >= 6 && $scope.pwd == $scope.pwd2) {
			var bday = $scope.demographicsNA ? "N/A" : $scope.dob.toString();
			console.log(bday);
			var sex = $scope.demographicsNA ? "N/A" : $scope.gender;
			var userRef = firebase.database().ref().child("users");
			$scope.users = $firebaseArray(userRef);
			var fullName = $scope.fName + " " + $scope.lName;
			firebase.auth().createUserWithEmailAndPassword($scope.email, $scope.pwd).then(function (userData) {
				console.log("User " + userData.uid + " created successfully!");
				user = firebase.auth().currentUser;
				userIdNum = userData.uid;
				firebase.database().ref().child("users").child(userData.uid).set({
					email: $scope.email,
					fName: $scope.fName,
					lName: $scope.lName,
					name: fullName,
					following: 0,
					credits: 0,
					dob: bday,
					gender: sex
				});
				firebase.database().ref().child("users").child(userIdNum).child("following").child(userIdNum).set({
					name: "self"
				});
				var form = document.getElementById("signupForm");
				form.reset();
				userIdNum = userData.uid;
				$scope.userId = userIdNum;
				currentUser = firebase.database().ref().child("users").child(userIdNum);
				userObj = $firebaseObject(currentUser);
				$scope.user = userObj;
				$scope.loggedIn = true;
				$scope.loadNpos();
				$scope.discover = true;
			}).catch(function (error) {
				var errorMessage = error.message;
				displayErrorMessage("signUpErrorMsg", errorMessage);
			});
		}
	}

	$scope.npoAdd = function () {
		if ($scope.npoPwd.length >= 6 && $scope.npoPwd == $scope.npoPwd2) {
			firebase.auth().createUserWithEmailAndPassword($scope.npoEmail, $scope.npoPwd).then(function (userData) {
				var nid = userData.uid;
				firebase.database().ref().child("npos").child(userData.uid).set({
					npoId: userData.uid,
					name: $scope.npoName,
					npoEmail: $scope.npoEmail,
					balance: 0,
					raised: 0,
					tagline: $scope.tagline,
					description: $scope.description,
					following: { nid: { 'self': $scope.npoName } }
				});
				var form = document.getElementById("npoSignupForm");
				form.reset();
			});
		}
	}

	$scope.follow = function (npo) {
		if ($scope.loggedIn) {
			firebase.database().ref().child("users").child(userIdNum).child("following").child(npo.$id).set({
				name: npo.name
			}).then(function () {
				console.log("followed " + npo.name);
			});
			firebase.database().ref().child("npos").child(npo.$id).child("followers").child(userIdNum).set({
				fName: userObj.fName,
				lName: userObj.lName
			}).then(function () {
				console.log(userObj.fName + " added to followers");
			});
		}
	}

	function allSectionsFalse() {
		$scope.about = false;
		$scope.showSignup = false;
		$scope.discover = false;
		$scope.feed = false;
		$scope.reload = false;
		$scope.userProfile = false;
		$scope.npoAbout = false;
		$scope.results = false;
		//$scope.$digest(); 
	}

	function displayErrorMessage(errorType, errorMessage) {
		var errorP = document.getElementById(errorType);
		errorP.innerHTML = errorMessage;
		errorP.style.color = "red";
	}

	$scope.checkPwd = function () {
		if ($scope.pwd && $scope.pwd.length < 6) {
			document.getElementById("pwdMessage").innerHTML = "Password must be at least 6 characters.";
			document.getElementById("pwdMessage").style.color = "red";
		} else if ($scope.pwd) {
			document.getElementById("pwdMessage").innerHTML = "";
			document.getElementById("pwd").style.borderBottom = "solid 2px #B8DEB8";
		} else {
			document.getElementById("pwdMessage").innerHTML = "";
			document.getElementById("pwd").style.border = "";
		}
	}

	$scope.checkPwdMatch = function () {
		if ($scope.pwd2 && $scope.pwd != $scope.pwd2) {
			document.getElementById("pwd2Message").innerHTML = "Passwords do not match.";
			document.getElementById("pwd2Message").style.color = "red";
			document.getElementById("pwd2").style.border = "";
		} else if ($scope.pwd2) {
			document.getElementById("pwd2").style.borderBottom = "solid 2px #B8DEB8";
			document.getElementById("pwd2Message").innerHTML = "";
		} else {
			document.getElementById("pwd2").style.border = "";
			document.getElementById("pwd2Message").innerHTML = "";
		}
	}

	$scope.login = function (result) {
		console.log("login");
		firebase.auth().signInWithEmailAndPassword($scope.loginEmail, $scope.loginPwd).then(function (userData) {
			user = firebase.auth().currentUser;
			userIdNum = userData.uid;
			currentUser = firebase.database().ref().child("users").child(userIdNum);
			userObj = $firebaseObject(currentUser);
			var curNpo = firebase.database().ref().child("npos").child(userIdNum);
			npoObj = $firebaseObject(curNpo);
			$scope.user = userObj;
			var form = document.getElementById("loginForm");
			form.reset();
			var dialog = document.querySelector('dialog');
			dialog.close();
			$scope.loggedIn = true;
			$scope.userId = userIdNum;
			allSectionsFalse();
			$scope.loadfeed();
			$scope.loadNpos();
			$scope.feed = true;
		}).catch(function (error) {
			// Handle Errors here.
			var errorCode = error.code;
			var errorMessage = error.message;
			console.log(errorMessage);
			var loginError = document.getElementById("loginErrorMsg");
			loginError.innerHTML = errorMessage;
			loginError.style.color = "red";
		});
	}

	$scope.logOut = function () {
		firebase.auth().signOut().then(function () {
			console.log("log out");
			$scope.loggedIn = false;
			allSectionsFalse();
			$scope.about = true;
			$scope.$digest();
		}).catch(function (error) {
			// An error happened.
		});
	}

	$scope.createPost = function () {
		var npoTagged = document.getElementById("chooseNPO").value;
		var bgImgCss = imgUrl ? "background-image: url('" + imgUrl + "')" : "";
		//imgUrl = imgUrl ? imgUrl : 0; 
		var postHeight = imgUrl ? "412px" : "176px";
		console.log(userObj);
		var fName = userObj.fName ? userObj.fName : npoObj.name;
		var lName = userObj.lName ? userObj.lName : npoObj.name;
		var byNpoBool = userObj.fName ? 0 : 1;
		if (npoTagged != "Tag an NPO") {
			firebase.database().ref().child("posts").push({
				userId: userIdNum,
				userFName: fName,
				userLName: lName,
				text: $scope.postText,
				npo: npoTagged,
				npoId: chosenNpoId,
				raised: 0,
				likes: 0,
				comments: 0,
				commentCount: 0,
				height: postHeight,
				bg: bgImgCss,
				byNpo: byNpoBool,
				time: firebase.database.ServerValue.TIMESTAMP
			});
			var form = document.getElementById("createPostForm");
			form.reset();
			document.getElementById("createPostTextarea").placeholder = "Write a post...";
			$scope.deleteImage();
			if (!document.getElementById("photoDiv").classList.contains("none")) {
				photoDiv.classList.add("none");
			}
			$scope.loadfeed();
		}
	}

	$scope.addPhoto = function () {
		var photoDiv = document.getElementById("photoDiv");
		if (photoDiv.classList.contains("none")) {
			photoDiv.classList.remove("none");
		} else {
			photoDiv.classList.add("none");
		}
	}

	$scope.loadfeed = function () {
		var postsRef = firebase.database().ref().child("posts");
		var allPosts = $firebaseArray(postsRef);
		var userFollowing = firebase.database().ref().child("users").child(userIdNum).child("following");
		var followingArr = $firebaseArray(userFollowing);

		$scope.posts = [];
		allPosts.$loaded().then(function () {
			followingArr.$loaded().then(function () {
				var followingIdArr = [];
				for (var i = 0; i < followingArr.length; i++) {
					followingIdArr.push(followingArr[i].$id);
				}
				console.log(followingIdArr);
				for (var i = 0; i < allPosts.length; i++) {
					if (followingIdArr.indexOf(allPosts[i].userId) > -1) {
						$scope.posts.push(allPosts[i]);
					}
				}
			});
		});
	}

	function loadNpoFeed(npo) {
		var postsRef = firebase.database().ref().child("posts");
		var allPosts = $firebaseArray(postsRef);

		$scope.npoPosts = [];
		allPosts.$loaded().then(function () {
			for (var i = 0; i < allPosts.length; i++) {
				if (allPosts[i].userId == npo.npoId) {
					$scope.npoPosts.push(allPosts[i]);
				}
			}
		});
	}

	$scope.loadUsersFeed = function () {
		var postsRef = firebase.database().ref().child("posts");
		var allPosts = $firebaseArray(postsRef);

		$scope.usersPosts = [];
		allPosts.$loaded().then(function () {
			for (var i = 0; i < allPosts.length; i++) {
				if (allPosts[i].userId == userIdNum) {
					$scope.usersPosts.push(allPosts[i]);
				}
			}
		});
	}

	$scope.loadNpos = function () {
		var userRef = firebase.database().ref().child("npos");
		$scope.npos = $firebaseArray(userRef);
	}

	$scope.loadNpoPage = function (npo) {
		$scope.individualNpo = npo;
		loadNpoFeed(npo);
		$scope.npoAbout = true;
		$scope.discover = false;
	}

	var chosenNpoId;
	$scope.choseNpo = function (npo) {
		document.getElementById("chooseNPO").value = npo.name;
		chosenNpoId = npo.$id;
		document.querySelector(".mdl-menu__container.is-visible").classList.remove("is-visible");
	}

	$scope.search = function () {
		console.log("search");
		var userArrRef = firebase.database().ref().child("users");
		var userArr = $firebaseArray(userArrRef);
		var npoArrRef = firebase.database().ref().child("npos");
		var npoArr = $firebaseArray(npoArrRef);
		$scope.searchResults = [];
		userArr.$loaded().then(function () {
			npoArr.$loaded().then(function () {
				var combined = userArr.concat(npoArr);
				for (var i = 0; i < combined.length; i++) {
					if (combined[i].name.toLowerCase().includes($scope.query.toLowerCase())) {
						$scope.searchResults.push(combined[i]);
					}
				}
			});
		});

		$scope.results = true;
	}

	$scope.loadReloadSelects = function () {
		var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		$scope.months = monthNames;
		$scope.years = ["2017", "2018", "2019", "2020", "2021"];
	}

	$scope.choseMonth = function (month) {
		document.getElementById("expireM").value = month;
		document.querySelector(".mdl-menu__container.is-visible").classList.remove("is-visible");
	}

	$scope.choseYear = function (year) {
		document.getElementById("expireY").value = year;
		document.querySelector(".mdl-menu__container.is-visible").classList.remove("is-visible");
	}

	$scope.addComment = function (post) {
		var commentsDiv = document.getElementById("commentsFor" + post.$id);
		if (commentsDiv.innerHTML) {
			commentsDiv.innerHTML = "";
		} else {
			var commentsRef = firebase.database().ref().child("posts").child(post.$id).child("comments");
			var comments = $firebaseArray(commentsRef);
			comments.$loaded().then(function (comments) {
				commentsDiv.innerHTML = "";
				var div = document.createElement("div");
				div.classList.add("commentsDisplay");
				commentsDiv.appendChild(div);
				if (comments.length > 0) {
					displayComments(comments, post);
				}
				var input = createCommentInput(commentsDiv);
				input.onkeypress = function (e) {
					if (!e) e = window.event;
					var keyCode = e.keyCode || e.which;
					if (keyCode == '13' && this.value) {
						if (checkUserCredits("comment")) {
							console.log("enter pressed");
							firebase.database().ref().child("posts").child(post.$id).child("comments").push({
								user: userIdNum,
								userFName: userObj.fName,
								userLName: userObj.lName,
								text: this.value,
								time: firebase.database.ServerValue.TIMESTAMP
							}).then(function () {
								var newCred = userObj.credits - 2;
								firebase.database().ref().child("users").child(userIdNum).child("credits").set(newCred);
								var newCommentCount = (post.commentCount ? post.commentCount : 0) + 1;
								firebase.database().ref().child("posts").child(post.$id).child("commentCount").set(newCommentCount);
								var newRaised = post.raised + 2;
								firebase.database().ref().child("posts").child(post.$id).child("raised").set(newRaised);
								incrementNpoCredit(post.npoId, 2);
								displayComments(comments, post);
								document.querySelector("#commentsFor" + post.$id + " input").value = "";
							});
							return false;
						}
					}
				}
			});
		}
	}

	function createCommentInput(commentsDiv) {
		var inputDiv = document.createElement("div");
		inputDiv.classList.add("mdl-textfield");
		inputDiv.classList.add("mdl-js-textfield");
		inputDiv.classList.add("mdl-textfield--floating-label");
		inputDiv.classList.add("commentInput");
		var input = document.createElement("input");
		input.type = "text";
		input.classList.add("mdl-textfield__input");
		input.id = "commentInput";
		var label = document.createElement("label");
		label.classList.add("mdl-textfield__label");
		label.for = "commentInput";
		label.innerHTML = "Add a comment...";
		inputDiv.appendChild(input);
		inputDiv.appendChild(label);
		commentsDiv.appendChild(inputDiv);
		componentHandler.upgradeElements(inputDiv);
		return input;
	}

	function incrementNpoCredit(npoId, amount) {
		var npo = $firebaseObject(firebase.database().ref().child("npos").child(npoId));
		npo.$loaded().then(function () {
			var newRaised = npo.raised ? npo.raised + amount : amount;
			var newBalance = npo.balance ? npo.balance + amount : amount;
			firebase.database().ref().child("npos").child(npoId).child("raised").set(newRaised);
			firebase.database().ref().child("npos").child(npoId).child("balance").set(newBalance);
		});
	}

	function displayComments(comments, post) {
		var div = document.querySelector("#commentsFor" + post.$id + " div.commentsDisplay");
		var ul = document.createElement("ul");
		ul.classList.add("demo-list-item");
		ul.classList.add("mdl-list");
		for (var i = 0; i < comments.length; i++) {
			var li = document.createElement("li");
			li.classList.add("mdl-list__item");
			var span = document.createElement("span");
			span.classList.add("mdl-list__item-primary-content");
			span.innerHTML = comments[i].text;
			var userSpan = document.createElement("span");
			userSpan.style.fontWeight = "bold";
			userSpan.innerHTML = comments[i].userFName + " " + comments[i].userLName;
			userSpan.style.marginRight = "1em";
			li.appendChild(userSpan);
			li.appendChild(span);
			if (comments[i].user == userIdNum) {
				var icon = document.createElement("i");
				icon.classList.add("material-icons");
				icon.classList.add("mdl-list__item-icon");
				icon.innerHTML = "delete";
				icon.id = comments[i].$id;
				icon.title = "Delete comment";
				icon.onclick = function () {
					firebase.database().ref().child("posts").child(post.$id).child("comments").child(this.id).remove();
					var newCount = post.commentCount - 1;
					firebase.database().ref().child("posts").child(post.$id).child("commentCount").set(newCount);
					var listItem = this.parentNode;
					listItem.parentNode.removeChild(listItem);
				}
				li.appendChild(icon);
			}
			ul.appendChild(li);
		}
		div.innerHTML = "";
		div.appendChild(ul);
	}

	$scope.deletePost = function (post) {
		if (confirm("Delete this post?")) {
			firebase.database().ref().child("posts").child(post.$id).remove();
			$scope.loadfeed();
		}
	}

	$scope.like = function (post) {
		if (checkUserCredits("like")) {
			var newLikes = post.likes + 1;
			var newRaised = post.raised + 1;
			var newCred = userObj.credits - 1;
			firebase.database().ref().child("users").child(userIdNum).child("credits").set(newCred);
			firebase.database().ref().child("posts").child(post.$id).child("likes").set(newLikes);
			firebase.database().ref().child("posts").child(post.$id).child("raised").set(newRaised);
			incrementNpoCredit(post.npoId, 1);
		}
	}

	$scope.setUpDialogs = function () {
		var dialog = document.querySelector('dialog');
		var showDialogButton = document.querySelector('#show-dialog');
		if (!dialog.showModal) {
			dialogPolyfill.registerDialog(dialog);
		}
		showDialogButton.addEventListener('click', function () {
			dialog.showModal();
		});
		dialog.querySelector('.close').addEventListener('click', function () {
			dialog.close();
		});

		var dialog2 = document.querySelector('#dialogBox2');
		var showDialogButton2 = document.querySelector('#demographicsButton');
		if (!dialog2.showModal) {
			dialogPolyfill.registerDialog(dialog2);
		}
		showDialogButton2.addEventListener('click', function () {
			dialog2.showModal();
		});
		dialog2.querySelector('.close').addEventListener('click', function () {
			dialog2.close();
		});
		dialog2.querySelector('#demoNextButton').addEventListener('click', function () {
			dialog2.close();
		});
	}

	$scope.reloadCredits = function () {
		var amount = document.getElementById("amount").value;
		var centAmount = amount * 100;
		var newCred = userObj.credits + centAmount;
		firebase.database().ref().child("users").child(userIdNum).child("credits").set(newCred);
		var form = document.getElementById("reloadForm");
		form.reset();
		alert("Successfully added $" + amount + " to your account!");
	}

	$scope.fileName = false;
	var storageRef = firebase.storage().ref();
	var imagesRef = storageRef.child('images');
	var imgUrl;

	$scope.previewFile = function () {
		var file = document.querySelector('input[type=file]').files[0];
		var metadata = {
			contentType: 'image/jpeg'
		};

		var uploadTask = storageRef.child('images/' + file.name).put(file, metadata);
		uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
			function (snapshot) {
				var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				console.log('Upload is ' + progress + '% done');
				switch (snapshot.state) {
					case firebase.storage.TaskState.PAUSED:
						console.log('Upload is paused');
						break;
					case firebase.storage.TaskState.RUNNING:
						console.log('Upload is running');
						break;
				}
			}, function (error) {
				console.log('error while uploading')
			}, function () {
				var starsRef = storageRef.child('images/' + file.name);
				starsRef.getDownloadURL().then(function (url) {
					document.querySelector('#preview').src = url;
					imgUrl = url;
					$scope.fileName = true;
					$scope.$digest();
				}).catch(function (error) {
					console.log('error while downloading file');
					console.log(error);
				});
			});

	}

	$scope.deleteImage = function () {
		var fileInput = document.getElementById('file_input_file');
		//var fileInputText = document.getElementById('file_input_text');
		fileInput.value = "";
		$scope.fileName = false;
		document.querySelector('#preview').src = "assets/placeholder-image.png";
		imgUrl = "";
		//$scope.$digest();
	}

	$scope.feedButton = function () {
		if ($scope.loggedIn && !$scope.feed) {
			allSectionsFalse();
			$scope.feed = true;
			$scope.loadfeed();
			//$scope.$digest();
		}
	}

	function checkUserCredits(type) {
		var amount = type == "like" ? 1 : 2;
		if (userObj.credits < amount) {
			alert("Insufficient funds, please reload your account. This can be done through your user profile page.");
			return false;
		} else {
			return true;
		}
	}
});

// app.directive('nop', function(){
//     return function($scope, $element) {
// 		$element.find('li.comment', click(function() {
// 			$element.find('div.commentDisplay').innerHTML = "some more stuff";
// 		}))
// 	}
// });

// function alert2(message, title, buttonText) {

//     buttonText = (buttonText == undefined) ? "Ok" : buttonText;
//     title = (title == undefined) ? "The page says:" : title;

//     var div = $('<div>');
//     div.html(message);
//     div.attr('title', title);
//     div.dialog({
//         autoOpen: true,
//         modal: true,
//         draggable: false,
//         resizable: false,
//         buttons: [{
//             text: buttonText,
//             click: function () {
//                 $(this).dialog("close");
//                 div.remove();
//             }
//         }]
//     });
// }