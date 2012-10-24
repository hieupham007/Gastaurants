var lat = 0;
var lon = 0;
var radius = Ti.App.Properties.getInt('radius', 5);
var limit = Ti.App.Properties.getInt('limit', 5);
var check = true;
var places;
var requestSent = false;
var querySent = false;

var restaurants;

var NAVIBRIDGE = require('ti.navibridge');
NAVIBRIDGE.SetApplicationID('ICiAV4Ay');


var win0 = Ti.UI.createWindow({
});
var win = Ti.UI.createWindow({
	fullscreen: true,
	navBarHidden: true//,
	//backgroundImage: 'bg.jpeg'
});

var font = {fontSize: 30};

/********************************************************                
 * 
 * Restaurants
 * 
 ********************************************************/
var restaurantButton = Ti.UI.createButton({
	top: '10%',
	width: '56%',
	height: '40%',
	//borderRadius: 5,
	backgroundImage: 'foodOrb.png'
	//font: font,
	//title: 'Restaurants'
});

restaurantButton.addEventListener('click', function(e) {
	
	if (!requestSent) {
		places = 'restaurant';
		sendRequest(1);
		requestSent = true;
	}
	
});

function addRefreshButton(tableView){
	if (!navGroup) {
		alert("Navgroup is undefined");
	}
	var refreshButton = Ti.UI.createButton({
		title: 'Refresh'
	});
}

function openWindow(type){
	var typeWindow = Ti.UI.createWindow({fullscreen:false, navBarHidden: false, backgroundColor: "white"});
	
	var table = Ti.UI.createTableView();
	for (var i = 0; i < limit; i++) {
		var row =  Ti.UI.createTableViewRow({
						height: '20%'
					});
		if (type == 1) {
			populateRestaurant(row, i, 1, '12%');
		} else if (type == 2) {
			populateRestaurant(row, i, 2, '25%');
		}

		table.appendRow(row);
	}
	
	typeWindow.add(table);
	navGroup.open(typeWindow, {animated:true});
}


function populateRestaurant(row, i, type, top) {
	if (!restaurants || (i >= restaurants.length)) {
		return;
	}
	restaurant = restaurants[i];
	var name = restaurant.name;
	var numReviews = restaurant.review_count;
	var ratingImage = restaurant.rating_img_url;
	var photo_url = restaurant.photo_url;
	var distance = restaurant.distance;
	var category = restaurant.categories[0].name;
	
	var ratingsView = Ti.UI.createView({
		width: '40%',
		height: '100%',
		right: 0,
		top: top,
		layout: 'vertical'
	});
	var ratingImage = Ti.UI.createImageView({
		image: ratingImage
	});
	var reviewsLabel = Ti.UI.createLabel({
		text: numReviews + " reviews",
		font: {fontSize: 14}
	});
	var distanceLabel = Ti.UI.createLabel({
		text: Math.round(distance*100)/100 + " miles",
		font: {fontSize: 12},
		color: 'blue'
	});
	if (type == 1) {
		var category = Ti.UI.createLabel({
			text: category,
			ellipsize: true,
			font: {fontSize: 14},
			color: 'red'
		});
	
		ratingsView.add(category);
	}
	ratingsView.add(ratingImage);
	ratingsView.add(reviewsLabel);
	ratingsView.add(distanceLabel);
	
	var titleView = Ti.UI.createView({
		width: '60%',
		height: '100%',
		left: 0,
		layout: 'horizontal'
	});
	
	var restaurantImage = Ti.UI.createImageView({
		image: photo_url,
		height: '80%',
		bottom: '10%',
		top: '10%'
	});
	var titleLabel = Ti.UI.createLabel({
		text: name,
		font: {fontSize: 14}
	});
	
	titleView.add(restaurantImage);
	titleView.add(titleLabel);
	
	row.add(titleView);
	row.add(ratingsView);
	
	row.addEventListener('click', function(e) {
		//Ti.API.info('latitude:' + restaurants[e.index].latitude + 'longitude: ' + restaurants[e.index].longitude);
		//NAVIBRIDGE.addPOI({ lat:37.42181310, lon: -122.08459170});
		if (!querySent) {
			queryForGeo(restaurants[e.index].address1, restaurants[e.index].city, restaurants[e.index].state);
			querySent = true;
		}
		//NAVIBRIDGE.addPOI({ lat:restaurants[e.index].latitude, lon:restaurant.longitude});
	});
}

function queryForGeo(address, city, state) {
	var addr = address.replace(/\s/g, '+');
	var c = city.replace(/\s/g, '+');
	var query = Ti.Network.createHTTPClient();
	query.onload = function()
	{
		var results =  JSON.parse(this.responseText);
		var lat = results.results[0].geometry.location.lat;
		var lon = results.results[0].geometry.location.lng;
		Ti.API.info('latitude:' + lat + 'longitude: ' + lon);
		NAVIBRIDGE.addPOI({lat:lat, lon:lon});
		querySent = false;
	};

	var searchUrl = 'http://maps.googleapis.com/maps/api/geocode/json?address=' + addr + ',+' + c + ',+' + state + '&sensor=true';
	Ti.API.info(searchUrl);
	query.open('GET', searchUrl);
	query.send();
}
win.add(restaurantButton);

/********************************************************                
 * 
 * Gas Stations
 * 
 ********************************************************/

var gasButton = Ti.UI.createButton({
	top: '50%',
	left: 0,
	width: '48%',
	height: '35%',
	backgroundImage: 'gasOrb.png'
	//borderRadius:5,
	//font: font,
	//title: 'Gas Stations'
});

gasButton.addEventListener('click', function(e) {
	
	if (!requestSent) {
		places = 'gas stations';
		sendRequest(2);
		requestSent = true;
	}
	
});

win.add(gasButton);

/********************************************************                
 * 
 * Options
 * 
 ********************************************************/

var optionsButton = Ti.UI.createButton({
	top: '65%',
	right: 0,
	width: '42%',
	height: '30%',
	backgroundImage: 'optionOrb.png'
});

optionsButton.addEventListener('click', function(e) {
		
	Ti.API.info("Animation callback");
	var optionsWindow = Ti.UI.createWindow({fullscreen: false, backgroundColor: 'white'});
	var optionsView = Ti.UI.createView({
		height: '70%'
	});
	var saveButton = Ti.UI.createButton({
		title: "Save",
		bottom: '15%'
	});
	saveButton.addEventListener('click', function(e){
		Ti.App.Properties.setInt('radius', radius);
		Ti.App.Properties.setInt('limit', limit);
		optionsWindow.close();
	});
	addOption(optionsView, 'Radius:', 0, 25, 10);
	addOption(optionsView, 'Limit:', 0, 10, 30);
	optionsWindow.add(optionsView);
	optionsWindow.add(saveButton);
	optionsWindow.open();
});

function addOption(view, optionName, min, max, top) {
	var nameLabel = Ti.UI.createLabel({
		text: optionName,
		top: top + '%',
		left: '5%',
		width: '25%',
		height: '15%',
		font: {fontSize: 20}
	});
	
	var slider;
	if (optionName == 'Radius:') {
		slider = Titanium.UI.createSlider({
			min:min,
			max:max,
			value: radius,
			width:'37%',
			height:'15%',
			top: (top + 5) + '%',
			left:'30%'
		});
	} else {
		slider = Titanium.UI.createSlider({
			min:min,
			max:max,
			value: limit,
			width:'37%',
			height:'15%',
			top: (top + 5) + '%',
			left:'30%'
		});
	}
	
	var valueLabel = Ti.UI.createLabel({
		text: Math.round(slider.value) + ' miles',
		top: top + '%',
		right: 0,
		width: '28%',
		height: '15%',
		font: {fontSize: 20}
	});
	
	slider.addEventListener('change', function(e){
		if (optionName == 'Radius:') {
			radius = Math.round(e.value);
			valueLabel.text = Math.round(e.value) + ' miles';
		} else if (optionName == 'Limit:') {
			limit = Math.round(e.value);
			valueLabel.text = Math.round(e.value) + ' entries';
		}
	});
	
	view.add(nameLabel);
	view.add(slider);
	view.add(valueLabel);
}

win.add(optionsButton);

var yelpLogo = Ti.UI.createButton({
	bottom: 0,
	backgroundImage: 'yelp.png',
	width: '100px',
	height: '20px'
});

yelpLogo.addEventListener('click', function() {
	var win3 = Ti.UI.createWindow({navBarHidden: false, fullscreen: false});
	navGroup.open(win3, {animated:true});
	win3.addEventListener('open', function() {
		var yelpSite = Ti.UI.createWebView({url: 'http://www.yelp.com'});
		win3.add(yelpSite);
		yelpSite.show();
	});
});

win.add(yelpLogo);

var navGroup = Ti.UI.iPhone.createNavigationGroup({
	window: win
});

win0.add(navGroup);
win0.open();

/********************************************************                
 * 
 * Http Request
 * 
 ********************************************************/

function sendRequest(type) {
	var xhr = Ti.Network.createHTTPClient();

	xhr.onload = function()
	{
		var results =  JSON.parse(this.responseText);
		//successful query
		if (results.message.text == 'OK') {
			restaurants = results.businesses;
			openWindow(type);
		} else if (results.message.code == 4){
			alert('Yelp queries exceed daily usage'); 
		} else {
			alert('Invalid Response');
		}
		requestSent = false;
	};

	var yourAPIKEY;
	var baseUrl = 'http://api.yelp.com/business_review_search?ywsid=' + yourAPIKEY + '&term=' + places + '&lat=' + lat + '&long=' + 
	lon + '&radius=' + radius + '&limit=' + limit;
	Ti.API.info(baseUrl);
	xhr.open('GET', baseUrl);
	xhr.send();

}

Ti.Geolocation.setAccuracy(Ti.Geolocation.ACCURACY_BEST);
Ti.Geolocation.purpose = "GPS demo";
if (Titanium.Geolocation.locationServicesEnabled === false) {
	alert('Your device has geo turned off - turn it on.');
}

Ti.Geolocation.addEventListener('location', function(e) {
	if (!e.success || e.error) {
		Ti.API.info('error:' + JSON.stringify(e.error));
		return;
	}
	
	lat = e.coords.latitude;
	lon = e.coords.longitude;
		
	
	
});

