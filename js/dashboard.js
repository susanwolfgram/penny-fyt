//functions to get different data
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

// function getUserDemos(){
//     var users = [];
//     var usersDT;
//     var usersRef = firebase.database().ref('users');
//     usersRef.on('value', function(snap){
//         snap.forEach(function(item){
//             s = item.val().gender;
//             dob = item.val().dob;
//             if(s && dob){
//                 users.push(item.val());
//             }
//         });
//         console.log(users);
//         usersDT = toDataFrame(users, "demos");
//     });
//     return usersDT;
// }

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

    }
	console.log(dt.toJSON());
	return dt;
}

function loadDashboard(){
    setTimeout(function(){drawCharts();}, 1000);
}


//not running after load?
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

function getMonth(data, rowNum){
    var mo = new Date(data.getValue(rowNum,2)).getMonth();
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[mo];

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


function drawSexCharts(){
    var d = google.visualization.arrayToDataTable([
        ['Sex', 'Comments'],
        ['Male', 20],
        ['Female', 51],
        ['Unknown', 29],
    ]);
    console.log(d);
    var chart = new google.visualization.PieChart(document.getElementById('sexGraph'));
    chart.draw(d);

}

function drawAgeCharts(){
    var d = google.visualization.arrayToDataTable([
        ['Age', 'Comments'],
        ['13-24', 51],
        ['25-34', 9],
        ['35-44', 9],
        ['45-54', 90],
        ['55-64', 84],
        ['65+', 9],

    ]);
    console.log(d);
    var chart = new google.visualization.PieChart(document.getElementById('ageGraph'));
    chart.draw(d);

}

function drawSexCharts(data){
    var pieChart = new google.visualization.PieChart(document.getElementById('sexGraph'));
    pieChart.draw(data);
    // var pieView = new google.visualization.DataView(data);
    // pieView.setColumns([0]);
    // var pieData = new google.visualization.data.group(
    //     pieView.toDataTable(),
    //     [0],
    //     google.visualization.data.sum,
    //     'number'
    // );
    // console.log(pieData.toJSON());
    // pieChart.draw(pieData);

    // var cols = ['Sex', 'Count']
    // var counts = {M:0, F:0, U:0}
    // var pieData = data.toJSON();
    // console.log(pieData);
    // // for (o in pieData){
    // //     console.log(o);
    // // }



}



function drawAgeCharts(data){

}




function drawCharts(){
    // postsDT = getPostData();
    // commentsData = getComments();
    followersData = getFollowersSex();
	// popPostsTable(postsDT);
    // drawMonthBarChart(postsDT);
    // drawLineChart(commentsData);
    // drawSexCharts();
    // drawAgeCharts();
    drawSexCharts(followersData);
}

window.onload = function(){
    google.charts.load('current', {packages: ['table', 'corechart'] });
    google.charts.setOnLoadCallback(getComments);
}
//google.charts.setOnLoadCallback(popPostsTable);
