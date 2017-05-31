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
	$scope.dashboard = false;
	$scope.otherUserFeed = false;

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
					gender: sex,
					isNpo: 0,
					image: 'assets/penny-logo-new.png'
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
					credits: 0,
					raised: 0,
					tagline: $scope.tagline,
					description: $scope.description,
					isNpo: 1,
					following: { nid: { 'self': $scope.npoName } }
				});
				var form = document.getElementById("npoSignupForm");
				form.reset();
			});
		}
	}

	$scope.follow = function (npo) {
		if (!$scope.loggedIn) {
			alert("Please login to continue.");
		} else {
			if ($scope.loggedIn && npo.isNpo) {
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
			} else if ($scope.loggedIn && !npo.isNpo) {
				firebase.database().ref().child("users").child(userIdNum).child("following").child(npo.$id).set({
					name: npo.name
				}).then(function () {
					console.log("followed " + npo.name);
				});
				firebase.database().ref().child("users").child(npo.$id).child("followers").child(userIdNum).set({
					fName: userObj.fName,
					lName: userObj.lName
				}).then(function () {
					console.log(userObj.fName + " added to followers");
				});
			}
			alert("You have followed " + npo.name);
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
		$scope.dashboard = false;
		$scope.otherUserProfile = false;
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
			console.log(userObj);
			console.log(npoObj);
			userObj.$loaded().then(function() {
				npoObj.$loaded().then(function() {
					if (npoObj.isNpo == 1) {
						console.log("inside if");
						$scope.user = npoObj;
						google.charts.load('current', {packages: ['table', 'corechart'] });
					} else {
						$scope.user = userObj;
					}
					$scope.loadfeed();
				});
			});
			
			var form = document.getElementById("loginForm");
			form.reset();
			var dialog = document.querySelector('dialog');
			dialog.close();
			$scope.loggedIn = true;
			$scope.userId = userIdNum;
			allSectionsFalse();
			
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
		var userFollowing; 
		if ($scope.user.isNpo) {
			userFollowing = firebase.database().ref().child("npos").child(userIdNum).child("following");
		} else {
			userFollowing = firebase.database().ref().child("users").child(userIdNum).child("following");
		}
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
		allSectionsFalse();
		$scope.userProfile = true;
		if ($scope.user.isNpo == 0) {
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
		} else {
			$scope.userProfile = false;
			$scope.dashboard = true; 
			curNpoId = npoObj.$id;
		}
	}

	$scope.loadOtherUserFeed = function(otherUser) {
		allSectionsFalse();
		$scope.otherUserProfile = true;
		$scope.otherUser = otherUser;
		$scope.otherUserPosts = [];
		
		var postsRef = firebase.database().ref().child("posts");
		var allPosts = $firebaseArray(postsRef);

		allPosts.$loaded().then(function () {
			for (var i = 0; i < allPosts.length; i++) {
				if (allPosts[i].userId == otherUser.$id) {
					$scope.otherUserPosts.push(allPosts[i]);
				}
			}
		});
		var otherUserTitle = document.getElementById("otherUserTitle");
		if (otherUser.isNpo) {
// 			//background-image: url("../assets/jar-of-pennies.jpg");
// 			background-repeat: no-repeat; 
//   background-position: center;
			
			otherUserTitle.style.backgroundImage = "url('" + otherUser.image + "')";
			otherUserTitle.style.backgroundRepeat = "no-repeat";
			otherUserTitle.style.backgroundPosition = "center";
			otherUserTitle.style.backgroundSize = "contain";
			otherUserTitle.style.backgroundColor = "white";
		} else {
			otherUserTitle.style.background = "#E3F2FD";
		}
	}

	$scope.loadNpos = function () {
		var userRef = firebase.database().ref().child("npos");
		$scope.npos = $firebaseArray(userRef);
	}

	$scope.loadNpoPage = function (npo) {
		allSectionsFalse();
		$scope.individualNpo = npo;
		loadNpoFeed(npo);
		$scope.npoAbout = true;
		//$scope.discover = false;
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
		var form = document.getElementById("searchForm");
		form.reset();

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

	$scope.addComment = function (post, num) {
		if (!$scope.loggedIn) {
			alert("Please login to continue.");
		} else {
			var commentsDiv = document.getElementById("commentsFor" + post.$id + num);
			console.log("commentsFor" + post.$id + num);
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
						displayComments(comments, post, num);
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
									var newCred = $scope.user.isNpo ? npoObj.credits - 2 : userObj.credits - 2;
									var userType = $scope.user.isNpo ? "npos" : "users";
									firebase.database().ref().child(userType).child(userIdNum).child("credits").set(newCred);
									var newCommentCount = (post.commentCount ? post.commentCount : 0) + 1;
									firebase.database().ref().child("posts").child(post.$id).child("commentCount").set(newCommentCount);
									var newRaised = post.raised + 2;
									firebase.database().ref().child("posts").child(post.$id).child("raised").set(newRaised);
									incrementNpoCredit(post.npoId, 2);
									displayComments(comments, post, num);
									document.querySelector("#commentsFor" + post.$id + num + " input").value = "";
								});
								return false;
							}
						}
					}
				});
			}
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
			var newBalance = npo.credits ? npo.credits + amount : amount;
			firebase.database().ref().child("npos").child(npoId).child("raised").set(newRaised);
			firebase.database().ref().child("npos").child(npoId).child("credits").set(newBalance);
		});
	}

	function displayComments(comments, post, num) {
		var div = document.querySelector("#commentsFor" + post.$id + num + " div.commentsDisplay");
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
			var newCred = $scope.user.isNpo ? npoObj.credits - 1 : userObj.credits - 1;
			var userType = $scope.user.isNpo ? "npos" : "user"; 
			firebase.database().ref().child(userType).child(userIdNum).child("credits").set(newCred);
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
		var userType = $scope.user.isNpo ? npoObj : userObj; 
		if (userType.credits < amount) {
			alert("Insufficient funds, please reload your account. This can be done through your user profile page.");
			return false;
		} else {
			return true;
		}
	}


	//functions to get different data

//Gets data about NPOs posts from Firebase and returns it it as a DataTable
var curNpoId = "3P5X0rWHQvPKmRrFyGkzn4gZ7XA3";
function getPostData(){
    
	var posts = [];
	var postDT;
	var postsRef = firebase.database().ref("posts");
	postsRef.orderByChild('npoId').equalTo(curNpoId).on('value', function(snap){
		snap.forEach(function(item) {
			var itemVal = item.val();
			posts.push(itemVal);
		});
		//console.log(posts);
		postDT = toDataFrame(posts, "posts");
	});
	return postDT;
}

//Gets data about NPOs followers' sex from Firebase and returns it it as a DataTable
function getFollowersSex(){
	var followers = [];
	var followersDT;
	var userRef = firebase.database().ref("users");
	userRef.orderByChild('lName').on('value', function(snap){
		snap.forEach(function(item){
			f = item.val().following;
            s = item.val().gender;
			if (f && s){
				if (curNpoId in f){
					followers.push(item.val());
				}
			}
		});
		//console.log(followers);
		followersDT = toDataFrame(followers, "followersSex")
	});
	return followersDT;
}

//Gets data about NPOs followers age from Firebase and returns it it as a DataTable
function getFollowersAge(){
	var followers = [];
	var followersDT;
	var userRef = firebase.database().ref("users");
	userRef.orderByChild('lName').on('value', function(snap){
		snap.forEach(function(item){
			f = item.val().following;
            dob = item.val().dob;
			if (f && dob){
				if (curNpoId in f){
					followers.push(item.val());
				}
			}
		});
		// console.log(followers);
		followersDT = toDataFrame(followers, "followersAge")
	});
	return followersDT;
}

//Gets data about comments from Firebase and returns it it as a DataTable
function getComments(){
    var comments = [];
    var commentsDT;
    var commentsRef = firebase.database().ref('posts');
    commentsRef.orderByChild('npoId').equalTo(curNpoId).on('value', function(snap){
        snap.forEach(function(item){
            c = item.val().comments;
            if(c){
                for (i in c){
                    comments.push(c[i]);
                }
            }
        });
        // console.log(comments);
        commentsDT = toDataFrame(comments, "comments");
    });
    return commentsDT;
}

//Helper function to change firebase data to google datatable
//Requires data and type of table to return as parameters
//Returns google DataTable
function toDataFrame(data, table){
	dt = new google.visualization.DataTable();
	if (table == "posts"){
		//have to add id 
		cols = { likes: "number", raised:"number", time:"number", commentCount:"number", userId:"string", text:"string"};
		for (var key in cols){
			var value = cols[key];
			dt.addColumn(value, key);
		}
		//another to read data and also place in table
		for (o in data){
			dt.addRow([data[o].likes, (data[o].raised/100), data[o].time, data[o].commentCount, data[o].userId, data[o].text]);
		}
	}else if(table == "followersSex"){
		cols = {gender: "string", count: "number"};
		for (var key in cols){
			var value = cols[key];
			dt.addColumn(value, key);
		}
		//another to read data and also place in table
        mCount = 0;
        fCount = 0;
        uCount = 0;
		for (o in data){
			if(data[o].gender == 'Male'){
                mCount++;
            }else if(data[o].gender =='Female'){
                fCount++;
            }else{
                uCount++;
            }
        dt.addRow(['Male', mCount]);
        dt.addRow(['Female', fCount]);
        dt.addRow(['Unknown', uCount]);
		}
	}else if(table == "comments"){
        cols = {time:"number", amt:"number"};
        for (var key in cols){
            var value = cols[key];
			dt.addColumn(value, key);
        }
        for (o in data){
            dt.addRow([data[o].time, 1]);
        }
    }else if(table == 'followersAge'){
        cols = {ageRange: "string", count: "number"};
        for(var key in cols){
            var value = cols[key];
            dt.addColumn(value, key);
        }
        var counts = [0, 0, 0, 0, 0, 0];
        for(o in data){
            age = calcAge(data[o].dob);
            if(age < 25){
                counts[0]++;
            }else if(age < 35){
                counts[1]++;
            }else if(age < 45){
                counts[2]++;
            }else if(age < 55){
                counts[3]++;
            }else if(age < 65){
                counts[4]++;
            }else{
                counts[5]++;
            }
        }
        dt.addRow(['13-24', counts[0]]);
        dt.addRow(['25-34', counts[1]]);
        dt.addRow(['35-44', counts[2]]);
        dt.addRow(['45-54', counts[3]]);
        dt.addRow(['55-64', counts[4]]);
        dt.addRow(['65+', counts[5]]);
    }
	// console.log(dt.toJSON());
	return dt;
}

function loadDashboard(){
    setTimeout(function(){drawCharts();}, 1000);
}

//Calculates age from given date of birth
function calcAge(dob){
    var today = new Date();
    var birthDate = new Date(dob);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) 
    {
        age--;
    }
    return age;
}

function popPostsTable(data){
	var table = new google.visualization.Table(document.getElementById('postlist'));
	var tblView = new google.visualization.DataView(data);
	tblView.setColumns([5, 1]);
    var options = {
        width:'100%', 

    };
	table.draw(tblView, options);
}

function popPostTable(){
	var table = new google.visualization.Table(document.getElementById('postlist'));
	var d = google.visualization.arrayToDataTable([
		['Post', 'Raised'],
		['Haiti', 109.11],
		['Think of the Children!',  199.76],
		['Promote Antifa',  985.76],
		['Black Lives Matter',  438.76],
		['DSA',  211.71],
		['Disaster Relief',  122.36],
		['Leukemia Research', 9176.71],
		['Cryogenic Freezing', 98.76],
		['Elon Musk\'s Arrest', 2981.56],
		['Get NDT off Twitter', 667.92],
		['Save the kittens', 5198.76],
		['Peace', 1740.01],
		['Love', 1137.15],
		['Happiness', 951.27],
		['Serenity', 844.76],
		['Help fire-destroyed homes', 1118.44],
		['Lymphoma Research', 128.76],
		['Renovate the Libary', 76.98],
		['Buy new syringes for the hospital!', 98.76],
		['Install solar panels around UW', 9118.76],
		['Beds for the Homeless!', 11.76]

	]);
    var options = {
        width:'100%', 

    };
	table.draw(d, options);
}


function drawMonthBarCharts(){
    var barChart = new google.visualization.ColumnChart(document.getElementById('monthBarGraph'));
    var d = google.visualization.arrayToDataTable([
        ['Month', 'Raised'],
        ['Jan', 2001.02],
        ['Feb', 5121.91],
        ['Mar', 2719.45],
        ['Apr', 1026.61],
        ['May', 3998.01],
        ['Jun', 8231.82],
        ['Jul', 8756.25],
        ['Aug', 3688.11],
        ['Sep', 8445.56],
        ['Oct', 8358.24],
        ['Nov', 5114.25],
        ['Dec', 4291.67]
    ]);
     var options = {
        title: "$ Raised by Month of Post Date",
        width: '100%',
        height: '100%',
        legend: {
             position: "none" 
        },
        bar: {
            groupWidth: "90%"
        },
        vAxis:{
            title: '$ Raised',
            format: 'currency'
        },
        hAxis:{
            textStyle:{
                bold: true,
            },
            title: 'Month',
        },
        titleTextStyle:{
            fontSize: 16,
        },
         tooltip:{
            textStyle:{
                fontSize:14,
            }
        }
      };
    barChart.draw(d, options);
}

//Draws the month bar chart
//Requires month data as parameter
function drawMonthBarChart(data){
    var barChart = new google.visualization.ColumnChart(document.getElementById('monthBarGraph'));
    var barView = new google.visualization.DataView(data);
    barView.setColumns([{calc:getMonth, type:'string'},1]);
    var barData = new google.visualization.data.group(
        barView.toDataTable(), 
        [0], 
        [{'column': 1, 'aggregation': google.visualization.data.sum, 'type': 'number'}]
        );
    // console.log(barData.toJSON());
    var options = {
        title: "$ Raised by Month of Post Date",
        width: '100%',
        height: '100%',
        legend: {
             position: "none" 
        },
        bar: {
            groupWidth: "90%"
        },
        vAxis:{
            title: '$ Raised',
            format: 'currency'
        },
        hAxis:{
            textStyle:{
                bold: true,
            },
            title: 'Month',
        },
        titleTextStyle:{
            fontSize: 16,
        },
         tooltip:{
            textStyle:{
                fontSize:14,
            }
        }
      };
    barChart.draw(barData, options);
}

//Helper function to get name of month from datetime number
function getMonth(data, rowNum){
    var mo = new Date(data.getValue(rowNum,2)).getMonth();
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[mo];

}


function drawLineCharts(){
    var lineChart = new google.visualization.LineChart(document.getElementById('commentsGraph'));
    var d = google.visualization.arrayToDataTable([
        ['Hours', 'Comments'],
        ['12AM - 2AM', 2013],
        ['2AM - 4AM', 5151],
        ['4AM - 6AM', 2925],
        ['6AM - 8AM', 1016],
        ['8AM - 10AM', 3913],
        ['10AM - 12PM', 8272],
        ['12PM - 2PM', 8793],
        ['2PM - 4PM', 3603],
        ['4PM - 6PM', 8425],
        ['6PM - 8PM', 8832],
        ['8PM - 10PM', 5177],
        ['10PM - 12AM', 4234]
    ]);
    var options = {
        title: 'Comments in Each Hour of the Day',
        hAxis: {
           title: 'Hour of the day'
        },
        vAxis: {
            title: 'Number of Comments',
        },
        titleTextStyle:{
            fontSize: 16,
        },
         tooltip:{
            textStyle:{
                fontSize:14,
            }
        },
         legend:{
            position:'none',
        },
        chartArea:{
            width:'85%',
        },
		width: '85%',
		pointSize: 5
    };
    lineChart.draw(d, options);
}


function drawLineChart(data){
    var lineChart = new google.visualization.LineChart(document.getElementById('commentsGraph'));
    var lineView = new google.visualization.DataView(data);
    lineView.setColumns([{calc:getTime, type:'string'}, 1]);
    var lineData = new google.visualization.data.group(
        lineView.toDataTable(),
        [0],
        [{'column': 1, 'aggregation': google.visualization.data.sum, 'type': 'number'}]
    );
    // console.log(lineData.toJSON());
   var options = {
        title: 'Comments in Each Hour of the Day',
        hAxis: {
           title: 'Hour of the day'
        },
        vAxis: {
            title: 'Number of Comments',
        },
        titleTextStyle:{
            fontSize: 16,
        },
         tooltip:{
            textStyle:{
                fontSize:14,
            }
        },
         legend:{
            position:'none',
        },
        chartArea:{
            width:'85%',
        },
		width: '85%'
    };
    lineChart.draw(lineData, options);
}

function getTime(data, rowNum){
    return new Date(data.getValue(rowNum,0)).getHours().toString();
}


function drawSexChart(){
    var d = google.visualization.arrayToDataTable([
        ['Sex', 'Comments'],
        ['Male', 2091],
        ['Female', 5151],
        ['Unknown', 291],
    ]);
    var options = {
        title: 'Sex distribution of followers',
        titleTextStyle:{
            fontSize: 16,
        },
        chartArea: {
            width: '100%',
            height: '80%',
        },
        pieSliceTextStyle:{
            fontSize: 18,
        },
        legend:{
            textStyle:{
                fontSize: 14,
            },
            alignment: 'end',
        },
        slices:{
            1: {color:'magenta'},
            2: {color:'green'},
        },
        tooltip:{
            textStyle:{
                fontSize:14,
            }
        }
    };
    var chart = new google.visualization.PieChart(document.getElementById('sexGraph'));
    chart.draw(d, options);

}

function drawAgeChart(){
    var d = google.visualization.arrayToDataTable([
        ['Age', 'Comments'],
        ['13-24', 513],
        ['25-34', 957],
        ['35-44', 294],
        ['45-54', 907],
        ['55-64', 384],
        ['65+', 96],
        ['Unknown', 101],
    ]);
    var options = {
        title: 'Age distribution of followers',
           titleTextStyle:{
            fontSize: 16,
        },
        chartArea:{
            width: '100%',
            height: '80%',
        },
        pieSliceTextStyle:{
            fontSize: 18,
        },
        legend:{
            textStyle:{
                fontSize: 14,
            },
            alignment: 'end',
        },
        tooltip:{
            textStyle:{
                fontSize:14,
            }
        }
    };
    var chart = new google.visualization.PieChart(document.getElementById('ageGraph'));
    chart.draw(d, options);

}

function drawSexCharts(data){
    var pieChart = new google.visualization.PieChart(document.getElementById('sexGraph'));
     var options = {
        title: 'Sex distribution of followers',
        titleTextStyle:{
            fontSize: 16,
        },
        chartArea: {
            width: '100%',
            height: '80%',
        },
        pieSliceTextStyle:{
            fontSize: 18,
        },
        legend:{
            textStyle:{
                fontSize: 14,
            },
            alignment: 'end',
        },
        slices:{
            1: {color:'magenta'},
            2: {color:'green'},
        },
        tooltip:{
            textStyle:{
                fontSize:14,
            }
        }
    };
    pieChart.draw(data, options);
}



function drawAgeCharts(data){
      var options = {
        title: 'Age distribution of followers',
           titleTextStyle:{
            fontSize: 16,
        },
        chartArea:{
            width: '100%',
            height: '80%',
        },
        pieSliceTextStyle:{
            fontSize: 18,
        },
        legend:{
            textStyle:{
                fontSize: 14,
            },
            alignment: 'end',
        },
        tooltip:{
            textStyle:{
                fontSize:14,
            }
        }
    };
    var pieChart = new google.visualization.PieChart(document.getElementById('ageGraph'));
    pieChart.draw(data, options);
}


$scope.drawCharts = function() {
    document.getElementById('pieCharts').style.display = 'block';
    document.getElementById('commentsGraph').style.display = 'block';
    postsDT = getPostData();
    commentsData = getComments();
    followersSexData = getFollowersSex();
	// popPostsTable(postsDT);
	popPostTable();

    //Real Methods to draw graphs
    // drawMonthBarChart(postsDT);
    // drawLineChart(commentsData);
    // followersAgeData = getFollowersAge();
    // drawSexCharts(followersSexData);
    // drawAgeCharts(followersAgeData);

    //demo ones

    drawMonthBarCharts();
    drawLineCharts();
    drawSexChart();
    drawAgeChart();
    document.getElementById('commentsGraph').style.display = 'none';
    document.getElementById('gButton').disabled = '';
}

    
    



$scope.toggle = function() {
   var dis = document.getElementById('commentsGraph').style.display;
   if(dis != 'none'){
        document.getElementById('pieCharts').style.display = 'block';
        document.getElementById('commentsGraph').style.display = 'none';
        document.getElementById('gButton').innerText = 'Show Line Chart'
   }else{
        document.getElementById('pieCharts').style.display = 'none';
        document.getElementById('commentsGraph').style.display = 'block';
        document.getElementById('gButton').innerText = 'Show Pie Charts'
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