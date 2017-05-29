//functions to get different data

//Gets data about NPOs posts from Firebase and returns it it as a DataTable
function getPostData(){
	var posts = [];
	var postDT;
	var postsRef = firebase.database().ref("posts");
	postsRef.orderByChild('npoId').equalTo("JStw39eY06ghvTwWRTOwsSe4OUB3").on('value', function(snap){
		snap.forEach(function(item) {
			var itemVal = item.val();
			posts.push(itemVal);
		});
		console.log(posts);
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
				if ("BFCzgPkBI4RtSGxoLlXqaGRevuF3" in f){
					followers.push(item.val());
				}
			}
		});
		console.log(followers);
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
				if ("BFCzgPkBI4RtSGxoLlXqaGRevuF3" in f){
					followers.push(item.val());
				}
			}
		});
		console.log(followers);
		followersDT = toDataFrame(followers, "followersAge")
	});
	return followersDT;
}

//Gets data about comments from Firebase and returns it it as a DataTable
function getComments(){
    var comments = [];
    var commentsDT;
    var commentsRef = firebase.database().ref('posts');
    commentsRef.orderByChild('npoId').equalTo("JStw39eY06ghvTwWRTOwsSe4OUB3").on('value', function(snap){
        snap.forEach(function(item){
            c = item.val().comments;
            if(c){
                for (i in c){
                    comments.push(c[i]);
                }
            }
        });
        console.log(comments);
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
			//console.log(key + " " + value);
			dt.addColumn(value, key);
		}
		//another to read data and also place in table
		for (o in data){
			dt.addRow([data[o].likes, data[o].raised, data[o].time, data[o].commentCount, data[o].userId, data[o].text]);
		}
	}else if(table == "followersSex"){
		cols = {gender: "string", count: "number"};
		for (var key in cols){
			var value = cols[key];
			//console.log(key + " " + value);
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
			//console.log(key + " " + value);
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
	console.log(dt.toJSON());
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

//not running after load?
//Populates the table of NPO posts
//Requres data to populate with as parameter
function popPostsTable(data){
	var table = new google.visualization.Table(document.getElementById('postlist'));
	var tblView = new google.visualization.DataView(data);
	tblView.setColumns([5, 1]);
    var tblClasses = {
        tableRow: 'dashRow',
        selectedTableRow: 'dashRowSelect'
    };
    var options = {
        width:'100%', 
        cssClassNames: tblClasses,
        showRowNumber: true
    };
	table.draw(tblView, options);
}

function drawMonthBarCharts(){
    var barChart = new google.visualization.ColumnChart(document.getElementById('monthBarGraph'));
    var d = google.visualization.arrayToDataTable([
        ['Month', 'Raised'],
        ['January', 20],
        ['Febuary', 51],
        ['March', 29],
        ['April', 10],
        ['May', 39],
        ['June', 82],
        ['July', 87],
        ['August', 36],
        ['September', 84],
        ['October', 88],
        ['November', 51],
        ['December', 42]
    ]);
    barChart.draw(d);
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
    console.log(barData.toJSON());
    var options = {
        title: "$ Raised by Month of Post Date",
        width: '100%',
        height: '100%',
        bar: {groupWidth: "50%"},
        legend: { position: "none" },
        hAxis:{
            title: 'Month'
        },
        vAxis:{
            title: '$ Raised'
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
        ['12AM - 2AM', 20],
        ['2AM - 4AM', 51],
        ['4AM - 6AM', 29],
        ['6AM - 8AM', 10],
        ['8AM - 10AM', 39],
        ['10AM - 12PM', 82],
        ['12PM - 2PM', 87],
        ['2PM - 4PM', 36],
        ['4PM - 6PM', 84],
        ['6PM - 8PM', 88],
        ['8PM - 10PM', 51],
        ['10PM - 12AM', 42]
    ]);
    var options = {
        title: 'Comments in each hour of the day',
        hAxis: {
           title: 'Hour of the day'
        },
        vAxis: {
            title: 'Number of Comments',
        }
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
    console.log(lineData.toJSON());
    var options = {
        title: 'Comments in each hour of the day',
        hAxis: {
           title: 'Hour of the day'
        },
        vAxis: {
            title: 'Number of Comments',
        }
    };
    lineChart.draw(lineData, options);
}

function getTime(data, rowNum){
    return new Date(data.getValue(rowNum,0)).getHours().toString();
}


function drawSexChart(){
    var d = google.visualization.arrayToDataTable([
        ['Sex', 'Comments'],
        ['Male', 20],
        ['Female', 51],
        ['Unknown', 29],
    ]);
     var options = {
        title: 'Sex distribution of followers',
    };
    console.log(d);
    var chart = new google.visualization.PieChart(document.getElementById('sexGraph'));
    chart.draw(d, options);

}

function drawAgeChart(){
    var d = google.visualization.arrayToDataTable([
        ['Age', 'Comments'],
        ['13-24', 51],
        ['25-34', 9],
        ['35-44', 9],
        ['45-54', 90],
        ['55-64', 84],
        ['65+', 9],

    ]);
    var options = {
        title: 'Age distribution of followers',
    };
    var chart = new google.visualization.PieChart(document.getElementById('ageGraph'));
    chart.draw(d, options);

}

function drawSexCharts(data){
    var pieChart = new google.visualization.PieChart(document.getElementById('sexGraph'));
    pieChart.draw(data);
}



function drawAgeCharts(data){
    var pieChart = new google.visualization.PieChart(document.getElementById('ageGraph'));
    pieChart.draw(data);
}


function drawCharts(){
    postsDT = getPostData();
    commentsData = getComments();
    followersSexData = getFollowersSex();
	popPostsTable(postsDT);
    drawMonthBarCharts();
    drawLineCharts();
    drawSexCharts();
    drawAgeCharts();
    followersAgeData = getFollowersAge();
    drawSexChart();
    drawAgeChart();
}

window.onload = function(){
    google.charts.load('current', {packages: ['table', 'corechart'] });
    google.charts.setOnLoadCallback(getComments);
}
