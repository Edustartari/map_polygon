import React, { Component, useRef, useEffect } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import DrawRectangle from './DrawRectangle.js';

export default function Map(props) {
	let current_value = { lng: -74.0060, lat: 40.7128 };
	// Get coordinates of the polygon
	if (props.polygon_area && Object.keys(props.polygon_area).length > 0) {
		let total_points = props.polygon_area.features[0].geometry.coordinates[0].length;
		let centroide = [0, 0];
		for (let i = 0; i < total_points; i++) {
			centroide[0] += props.polygon_area.features[0].geometry.coordinates[0][i][0];
			centroide[1] += props.polygon_area.features[0].geometry.coordinates[0][i][1];
		}
		centroide[0] = centroide[0] / total_points;
		centroide[1] = centroide[1] / total_points;	
	
		current_value = { lng: centroide[0], lat: centroide[1] };
	}

	const city = current_value;
	const zoom = 14;
	maptilersdk.config.apiKey = '5mcAFpW4XEpxkzKBTeTP';

	useEffect(() => {
		const map = new maptilersdk.Map({
			container: 'map',
			style: maptilersdk.MapStyle.STREETS,
			center: [city.lng, city.lat],
			zoom: zoom,
			navigationControl: true,
		});

		const draw = new MapboxDraw({
			displayControlsDefault: false,
			controls: {
				polygon: true,
				trash: true,
				navigationControl: true,
			},
			modes: Object.assign(MapboxDraw.modes, {
				draw_rectangle: DrawRectangle
			})
		});

		map.addControl(draw, 'top-right');
		map.addControl(new maptilersdk.FullscreenControl(), 'top-right');

		map.on('draw.create', updateFilterArea);
		map.on('draw.delete', deleteFilterArea);
		map.on('draw.update', updateFilterArea);

		const gc = new maptilersdkMaptilerGeocoder.GeocodingControl();

		map.addControl(gc, 'top-left');

		function updateFilterArea(e) {
			const data = draw.getAll();
			const drawBbox = turf.bbox(data);
            props.setPolygonBackup(data);

			gc.setOptions({ bbox: drawBbox });
		}

		function deleteFilterArea(e) {
			gc.setOptions({ bbox: null });
		}
		
		// Execute search to display in map as soon user picks a Country
		// gc.setQuery('Mexico', true);

		// Create a polygon from the coordinates
		if(props.polygon_area && Object.keys(props.polygon_area).length > 0) {
			const bboxPolygon = turf.bboxPolygon(turf.bbox(props.polygon_area));
			const feature = turf.featureCollection([bboxPolygon]);
			draw.add(feature);
		}

		map.on('draw.modechange', function (e) {
			if (e.mode === 'draw_polygon') {
				draw.deleteAll();
				draw.changeMode('draw_rectangle');
			}
		});
        
	}, [city.lng, city.lat, zoom]);

	return <div className='Map' id="map"></div>;
}
