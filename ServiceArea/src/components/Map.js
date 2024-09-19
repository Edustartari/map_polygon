import React, { Component, useRef, useEffect } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import DrawRectangle from './DrawRectangle.js';

export default function Map(props) {
	const city = { lng: -74.0060, lat: 40.7128 };
	const zoom = 14;
	maptilersdk.config.apiKey = '5mcAFpW4XEpxkzKBTeTP';

	const bbox = [-0.499878, 51.268789, 0.304871, 51.710863];

	useEffect(() => {
		const map = new maptilersdk.Map({
			container: 'map',
			style: maptilersdk.MapStyle.STREETS,
			center: [city.lng, city.lat],
			zoom: zoom
		});

		const draw = new MapboxDraw({
			displayControlsDefault: false,
			controls: {
				polygon: true,
				trash: true
			},
			modes: Object.assign(MapboxDraw.modes, {
				draw_rectangle: DrawRectangle
			})
		});

		map.addControl(draw, 'top-right');

		map.on('draw.create', updateFilterArea);
		map.on('draw.delete', deleteFilterArea);
		map.on('draw.update', updateFilterArea);

		const gc = new maptilersdkMaptilerGeocoder.GeocodingControl({
			bbox: bbox
		});

		map.addControl(gc, 'top-left');

		function updateFilterArea(e) {
			const data = draw.getAll();
			const drawBbox = turf.bbox(data);
            props.setPolygonArea(data);

			gc.setOptions({ bbox: drawBbox });
		}

		function deleteFilterArea(e) {
			gc.setOptions({ bbox: null });
		}

		//initial load London area polygon.
		map.on('load', function () {
			const feature = turf.bboxPolygon(bbox);
			draw.add(feature);
		});

		map.on('draw.modechange', function (e) {
			if (e.mode === 'draw_polygon') {
				draw.deleteAll();
				draw.changeMode('draw_rectangle');
			}
		});
        
	}, [city.lng, city.lat, zoom]);


	return <div className='Map' id="map"></div>;
}
