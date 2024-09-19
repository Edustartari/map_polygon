import { render } from "react-dom";
import '../../static/ServiceArea/App.css';
import Map from './Map.js';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import React, { Component, useRef, useEffect } from 'react';

let data_list = content.data_list

export default function App() {

  const [polygon_area, setPolygonArea] = React.useState({});
  const [state, setState] = React.useState({
    name: '',
    email: '',
    phone: '',
    language: '',
    currency: '',
    area_id: '',
    area_name: '',
    price: '',
    snackbar_open: '',
    snackbar_message: '',
    enable_delete: false
  });

  const { name, email, phone, language, currency, area_id, area_name, price, snackbar_open, snackbar_message, enable_delete } = state;

  const validate_fields = () => {

    if (!name || !email || !phone || !language || !currency || !area_name || !price){
      return "You must provide all the fields" ;
    }

    if (!polygon_area){
      return 'You must select an area in the map';
    }

    return '';
  }

  const save_form = () => {

    let response = validate_fields();
    if (response.length > 0){
      setState({ ...state, snackbar_open: true , snackbar_message: response });
      return;
    }

    let dict_data = {
      name: name,
      email: email,
      phone: phone,
      language: language,
      currency: currency,
      area_id: area_id,
      area_name: area_name,
      price: price,
      polygon_area: polygon_area
    }
    
    $.ajax({
      context: this,
      url: '/save-form/',
      type: 'POST',
      data: {
        dict_data: JSON.stringify(dict_data)
      },
      success: function (data) {
        if(data.status === 'success'){
          if(area_id !== ''){
            let data = data_list.filter(element => element.area_id == area_id)[0];
            dict_data['provider_id'] = data['provider_id'];
            let updated_list = data_list.filter(element => element.area_id != area_id);
            updated_list.push(dict_data);
            data_list = updated_list;
          } else {
            data_list.push(dict_data);
          }
          setState({ ...state, snackbar_open: true , snackbar_message: 'Success' });
          empty_form();
        }
      },
      error: function () {
        setState({ ...state, snackbar_open: true , snackbar_message: 'An error has occurred, please try again.' });
      },
      complete: function () {}
    });
  }

  const load_form = () => {
    if (!area_id){
      setState({ ...state, snackbar_open: true , snackbar_message: 'You must select a data' });
      return;
    }

    let data = data_list.filter(element => element.area_id == area_id)[0];

    setState({ ...state,
      name: data['name'],
      email: data['email'],
      phone: data['phone'],
      language: data['language'],
      currency: data['currency'],
      area_id: data['area_id'],
      area_name: data['area_name'],
      price: data['price'],
      enable_delete: true
    });

    setPolygonArea(data['polygon_area']);
  }

  const delete_form = () => {

    $.ajax({
      context: this,
      url: '/delete-form/',
      type: 'POST',
      data: {
        area_id: JSON.stringify(area_id)
      },
      success: function (data) {
        if(area_id !== ''){
          let updated_list = data_list.filter(element => element.area_id != area_id);
          data_list = updated_list;
        }
        setState({ ...state, snackbar_open: true , snackbar_message: 'Deleted!' });
        empty_form();
      },
      error: function () {
        setState({ ...state, snackbar_open: true , snackbar_message: 'An error has occurred, please try again.' });
      },
      complete: function () {}
    });

    if(area_id !== ''){
      let updated_list = data_list.filter(element => element.area_id != area_id);
      data_list = updated_list;
    } else {
      setState({ ...state, snackbar_open: true , snackbar_message: 'You must select a data' });
    }
  }

  const empty_form = () => {

    setState({ ...state,
      name: '',
      email: '',
      phone: '',
      language: '', 
      currency: '', 
      area_id: '',
      area_name: '',
      price: '',
      enable_delete: false
    });

    setPolygonArea({});
  }

  const handleClose = (event, reason) => {
    setState({ ...state, snackbar_open: false });
  };

  const setSelectedData = (event) => {
    setState({ ...state, area_id: event.target.value });
  }

    return (
      <div className="App">
        <div className="main-container">
          {data_list.length > 0 &&
            <div className="load-header">
              <div className="load-heade-title">SELECT DATA</div>
              <div className="load-heade-subtitle">You can select data saved at database or just fill a new form below. Don't forget to click "SAVE"</div>
              <div className="load-header-select">
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={area_id}
                  label="Area Saved"
                  onChange={(e) => {setSelectedData(e)}}
                >
                  {data_list.map((element, index) => {
                    return <MenuItem key={index} value={element.area_id}>Email: {element.email} / Area name: {element.area_name}</MenuItem>
                  })}
                </Select>
              </div>
              <div className="load-header-button">
                <Button variant="contained" onClick={load_form}>LOAD</Button>
                {enable_delete &&
                  <React.Fragment>
                    <Button variant="contained" onClick={delete_form}>DELETE</Button>
                    <Button variant="contained" onClick={empty_form}>EMPTY</Button>
                  </React.Fragment>
                }
              </div>
            </div>
          }
          {data_list.length === 0 &&
            <div className="load-header">
              <div className="load-heade-title">EMPTY DATA</div>
              <div className="load-heade-subtitle">You don't have any data saved yet at our database. Go ahead and fill the form below</div>
            </div>
          }
          
          <div className="form-title">FORM</div>
          <div className="form-inputs">
            <div className="form-inputs-left">
              <TextField
                id="outlined-controlled"
                label="Provider Name"
                value={state.name}
                onChange={(event) => {
                  setState({ ...state, name: event.target.value });
                }}
              />
              <TextField
                id="outlined-controlled"
                label="Email"
                value={email}
                onChange={(event) => {
                  setState({ ...state, email: event.target.value });
                }}
              />
              <TextField
                id="outlined-controlled"
                label="Phone"
                value={phone}
                onChange={(event) => {
                  setState({ ...state, phone: event.target.value });
                }}
              />
              <TextField
                id="outlined-controlled"
                label="Language"
                value={language}
                onChange={(event) => {
                  setState({ ...state, language: event.target.value });
                }}
              />
              <TextField
                id="outlined-controlled"
                label="Currency"
                value={currency}
                onChange={(event) => {
                  setState({ ...state, currency: event.target.value });
                }}
              />
              <TextField
                id="outlined-controlled"
                label="Service Area Name"
                value={area_name}
                onChange={(event) => {
                  setState({ ...state, area_name: event.target.value });
                }}
              />
              <TextField
                id="outlined-controlled"
                label="Price"
                value={price}
                onChange={(event) => {
                  setState({ ...state, price: event.target.value });
                }}
              />
            </div>
            <div className="form-inputs-bottom">
              <div>Service Area:</div>
              {'features' in polygon_area &&
                <React.Fragment>
                  {polygon_area.features[0].geometry.coordinates[0].map((element, index) => (
                    <div key={index}>Lng: {element[0]} / Lat: {element[1]}</div>
                  ))}
                </React.Fragment>
              }
            </div>
          </div>
        </div>
        <Map setPolygonArea={setPolygonArea}/>
        <Button variant="contained" onClick={save_form}>SAVE</Button>
        <Snackbar
          open={snackbar_open}
          autoHideDuration={2000}
          onClose={handleClose}
          message={snackbar_message}
        />
      </div>
    );
  }

const appDiv = document.getElementById("app");
render(<App />, appDiv);