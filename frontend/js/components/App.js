import { render } from "react-dom";
import '../../css/App.css';
import Map from './Map.js';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import countries from '../countries.json';
import React, { useState } from 'react';

// Create a modal to force user to provide credentials
// This modal will have mock data to simulate a REST API authentication flow
// Present an option to user skip authentication

const LoginDialog = (props) => {
  const { setOpenLogin, open, setLoading } = props;
  console.log('props: ', props);

  const handleLogin = async () => {
    let response = await fetch('/google-login/')
    console.log('response: ', response);
    
    response = await response.json();
    let redirect_url = response.redirect_url;
    console.log('redirect_url: ', redirect_url);
    if (redirect_url) {
      // Redirect the user to the Google login page
      window.location.href = redirect_url;
    }
    // If the response is successful, close the dialog
    setOpenLogin(false);
  }

  return (
    <Dialog onClose={() => setOpenLogin(false)} open={open}>
      <DialogTitle>Login</DialogTitle>
      <div className="login-dialog-container">
        <div className="login-dialog-box" onClick={() => {setLoading(true), handleLogin()}}>Button</div>
        <div className="login-dialog-footer">
          <div className="login-dialog-footer-button" onClick={() => setOpenLogin(false)}>Skip</div>
        </div>
      </div>
    </Dialog>
  );
}

const WelcomeDialog = (props) => {
  const { setOpenWelcomeDialog, open, setLoading } = props;
  console.log('props: ', props);

  const handleLogout = async () => {
    // let response = await fetch('/google-login/')
    // console.log('response: ', response);
    
    // response = await response.json();
    // let redirect_url = response.redirect_url;
    // console.log('redirect_url: ', redirect_url);
    // if (redirect_url) {
    //   // Redirect the user to the Google login page
    //   window.location.href = redirect_url;
    // }
    // If the response is successful, close the dialog
    setOpenWelcomeDialog(false);
  }

  return (
    <Dialog onClose={() => setOpenWelcomeDialog(false)} open={open}>
      <DialogTitle>Welcome {content.user_info.given_name}!</DialogTitle>
      <div className="welcome-dialog-container">
        <div className="welcome-dialog-box" onClick={() => {setLoading(true), handleLogout()}}>Logout</div>
        <div className="welcome-dialog-footer">
          <div className="welcome-dialog-footer-button" onClick={() => setOpenWelcomeDialog(false)}>Close</div>
        </div>
      </div>
    </Dialog>
  );
}

export default function App() {

  const [polygon_area, setPolygonArea] = React.useState({});
  const [polygonBackup, setPolygonBackup] = React.useState({});
  const [data_list, setDataList] = React.useState(content.data_list);
  const [state, setState] = React.useState({
    name: '',
    email: '',
    phone: '',
    area_id: '',
    area_name: '',
    country: '',
    snackbar_open: '',
    snackbar_message: '',
    enable_delete: false
  });
  const [openLogin, setOpenLogin] = React.useState(Object.keys(content.user_info).length === 0);
  const [openWelcomeDialog, setOpenWelcomeDialog] = React.useState(Object.keys(content.user_info).length > 0);
  const [loading, setLoading] = React.useState(false);

  const { name, email, phone, area_id, area_name, country, snackbar_open, snackbar_message, enable_delete } = state;

  const validate_fields = () => {

    if (!name || !email || !phone || !area_name || !country){
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
      area_id: area_id,
      area_name: area_name,
      country: country,
      polygon_area: polygonBackup
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
          let new_list = data_list;
          if(area_id !== ''){
            let data = data_list.filter(element => element.area_id == area_id)[0];
            dict_data['provider_id'] = data['provider_id'];
            let updated_list = data_list.filter(element => element.area_id != area_id);
            updated_list.push(dict_data);
            new_list = updated_list;
          } else {
            dict_data['area_id'] = data['area_id'];
            new_list.push(dict_data);
          }
          setDataList(new_list);
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
      area_id: data['area_id'],
      area_name: data['area_name'],
      country: data['country'],
      enable_delete: true
    });

    setPolygonArea(data['polygon_area']);
    setPolygonBackup(data['polygon_area']);
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
          setDataList(updated_list);
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
      setDataList(updated_list);
    } else {
      setState({ ...state, snackbar_open: true , snackbar_message: 'You must select a data' });
    }
  }

  const empty_form = () => {

    setState({ ...state,
      name: '',
      email: '',
      phone: '',
      area_id: '',
      area_name: '',
      country: '',
      enable_delete: false
    });

    setPolygonArea({});
    setPolygonBackup({});
  }

  const handleClose = (event, reason) => {
    setState({ ...state, snackbar_open: false });
  };

  const setSelectedData = (event) => {
    setState({ ...state, area_id: event.target.value });
  }

  const setCountry = (event) => {
    console.log('event: ', event.target.value)
    let country = countries.filter(element => element.code == event.target.value)[0];
    console.log('country: ', country)
    setState({ ...state, country: country });
  }

  console.log('')
  console.log('data_list: ', data_list)
  console.log('country: ', country)

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
                  className="load-header-select-component"
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
                <Button className="load-header-button-details" variant="contained" onClick={load_form}>LOAD</Button>
                {enable_delete &&
                  <React.Fragment>
                    <Button className="load-header-button-details" variant="contained" onClick={delete_form}>DELETE</Button>
                    <Button className="load-header-button-details" variant="contained" onClick={empty_form}>EMPTY</Button>
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
                className="form-input-component"
                id="outlined-controlled"
                label="Provider Name"
                value={state.name}
                onChange={(event) => {
                  setState({ ...state, name: event.target.value });
                }}
              />
              <TextField
                className="form-input-component"
                id="outlined-controlled"
                label="Email"
                value={email}
                onChange={(event) => {
                  setState({ ...state, email: event.target.value });
                }}
              />
              <TextField
                className="form-input-component"
                id="outlined-controlled"
                label="Phone"
                value={phone}
                onChange={(event) => {
                  setState({ ...state, phone: event.target.value });
                }}
              />
              <TextField
                className="form-input-component"
                id="outlined-controlled"
                label="Service Area Name"
                value={area_name}
                onChange={(event) => {
                  setState({ ...state, area_name: event.target.value });
                }}
              />
            </div>
            <div className="form-input-select-country-container">
              <div className="form-input-select-country-title">COUNTRY</div>
              <Select
                className="countries-select-component"
                value={country.code}
                label="Country"
                onChange={(e) => {setCountry(e)}}
              >
                <MenuItem disabled value="">
                  <em>Country</em>
                </MenuItem>
                {countries.map((element) => {
                  return <MenuItem key={element.code} value={element.code}>{element.name}</MenuItem>
                })}
              </Select>
            </div>
            {'features' in polygonBackup &&
              <div className="form-inputs-bottom">
                <div className="form-inputs-bottom-box">
                  <div>Coordinates:</div>
                    <React.Fragment>
                      {polygonBackup.features[0].geometry.coordinates[0].map((element, index) => (
                        <div key={index}>Lng: {element[0]} / Lat: {element[1]}</div>
                      ))}
                    </React.Fragment>
                </div>
                <div className="form-inputs-bottom-box">
                  <div className="form-inputs-bottom-country-info">info</div>
                </div>
              </div>
            }
          </div>
        </div>
        <Map setPolygonArea={setPolygonArea} polygon_area={polygon_area} setPolygonBackup={setPolygonBackup}/>
        <Button className="load-header-button-details" variant="contained" onClick={save_form}>SAVE</Button>
        <Snackbar
          open={snackbar_open}
          autoHideDuration={2000}
          onClose={handleClose}
          message={snackbar_message}
        />
        <LoginDialog
          open={openLogin}
          setOpenLogin={setOpenLogin}
          setLoading={setLoading}
        />
        <WelcomeDialog
          open={openWelcomeDialog}
          setOpenWelcomeDialog={setOpenWelcomeDialog}
          setLoading={setLoading}
        />
        <Backdrop
          sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
    );
  }

const appDiv = document.getElementById("app");
render(<App />, appDiv);