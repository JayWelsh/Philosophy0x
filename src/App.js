import React, { Component } from 'react';
import './App.css';
import AppRoot from './components/AppRoot';
import { Provider } from 'react-redux'
import store from './state';

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <AppRoot/>
      </Provider>
    );
  }
}

export default App;
