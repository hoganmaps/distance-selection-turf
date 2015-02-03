		var map = L.map('map').setView([51.505, -0.09], 13);

		L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
			maxZoom: 18,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
			id: 'examples.map-i875mjb7'
		}).addTo(map);

		//declare empty point layer which will have data added to it when d3 parses the csv
		var geoJsonLyr, geoData, nearestToPoint;

		//circle marker styles
		var greenMarker = {
		    radius: 9,
		    fillColor: "#00b200",
		    color: "#ffffff",
		    weight: 2,
		    opacity: 1,
		    fillOpacity: 0.9
		};

		var redMarker = {
		    radius: 6,
		    fillColor: "#ff7800",
		    color: "#ffffff",
		    weight: 2,
		    opacity: 1,
		    fillOpacity: 0.8
		};

		var greyMarker = {
		    radius: 6,
		    fillColor: "#6B6B6B",
		    color: "#ffffff",
		    weight: 2,
		    opacity: 1,
		    fillOpacity: 0.8
		};
		//clickstart set up
		function onMapClick(e) {
			
			var usedPointArray = []
			function runProcess(inPoint){
				//get the clicked point as a turf point
			    var selectedTurfPoint = turf.point(inPoint);
			    usedPointArray.push(inPoint)
			    L.geoJson(selectedTurfPoint,{
			    	pointToLayer: function (feature, latlng) {
				        return L.circleMarker(latlng, greenMarker);
				    }})
			    	.addTo(map);

			    //generate the minimum distance buffer
			    var bufferedTurfPolyNear = turf.buffer(selectedTurfPoint, .25, 'kilometers');

			    //generate maximum distance buffer
			    var bufferedTurfPolyFar = turf.buffer(selectedTurfPoint, .5, 'kilometers');

			    //erase the min dist buffer from max dist buffer, donut!
			    var justFarBuffer = turf.erase(
			    	turf.polygon(bufferedTurfPolyFar.features[0].geometry.coordinates), 
			    	turf.polygon(bufferedTurfPolyNear.features[0].geometry.coordinates)
			    );

			    //Show the buffer donut on the map
			    var buffShow = L.geoJson(justFarBuffer).addTo(map);
			    
			    //find all the points within the buffer donut
			    var bigBufferPoints = turf.within(geoData, turf.featurecollection([justFarBuffer]));

			    try{
				    for (i = 0; i < usedPointArray.length; i++) { 
				    	console.log(usedPointArray);
				    	for (j = 0; j < bigBufferPoints.features.length; j++) { 
				    		if(
				    			(bigBufferPoints.features[j].geometry.coordinates[0] === usedPointArray[i][0]) && 
				    			(bigBufferPoints.features[j].geometry.coordinates[1] === usedPointArray[i][1]) ){
				    			// 	console.log('deleting a point');
				    			// console.log(bigBufferPoints.features[j]);
				    			console.log(bigBufferPoints.features[j].geometry.coordinates[0]);
				    			console.log(usedPointArray[i][0]);
				    				delete bigBufferPoints.features[j];
				    		}
				    	}
					};
				}
				catch(err){
					//err
				}
			    //calculate the buffer donut point closest to the origin/selectedTurfPoint and show it on map
				nearestToPoint = turf.nearest(selectedTurfPoint, bigBufferPoints);
			    L.geoJson(nearestToPoint,{
			    	pointToLayer: function (feature, latlng) {
				        return L.circleMarker(latlng, redMarker);
				    }
			    }).addTo(map);

			    //after 1.5 seconds remove the buffer
			    setTimeout( function(){map.removeLayer(buffShow)}, 1500 );
			}
			runProcess(e.layer.feature.geometry.coordinates);
			// runProcess(nearestToPoint.geometry.coordinates);
			// runProcess(nearestToPoint.geometry.coordinates);
			// runProcess(nearestToPoint.geometry.coordinates);
			// runProcess(nearestToPoint.geometry.coordinates);
			// runProcess(nearestToPoint.geometry.coordinates);
			// runProcess(nearestToPoint.geometry.coordinates);
			// runProcess(nearestToPoint.geometry.coordinates);
			// runProcess(nearestToPoint.geometry.coordinates);
			// runProcess(nearestToPoint.geometry.coordinates);
			// runProcess(nearestToPoint.geometry.coordinates);
		};
		d3.csv('data/Points_for_testing.csv', function(err, inData){
			//borrowed from here http://bl.ocks.org/sumbera/10463358
            var data = [];
            inData.map(function (d, i) {
                data.push({
                    id: i,
                    type: "Feature",
                    properties: {
                    	uid: d.UID
                    },
                    geometry: {
                        coordinates: [+d.Longitude, +d.Latitude],
                        type: "Point"
                    }
                });
            });
            geoData = { type: "FeatureCollection", features: data };
            geoJsonLyr = L.geoJson(geoData, {
	            	pointToLayer: function (feature, latlng) {
				        return L.circleMarker(latlng, greyMarker);
				    }
				})
            	.on('click', onMapClick)
            	.addTo(map);
            map.fitBounds(geoJsonLyr.getBounds());
		});