import React, { Component } from 'react';
import Dashboard from './Dashboard';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import HomeIcon from '@material-ui/icons/Home';
import { withStyles } from '@material-ui/core/styles';
import { initAccount } from "../util/MetaMask";
import philosophy0xLogo from "../img/Philosophy0x.png";
import { connect } from 'react-redux';
import store from '../state';
import web3 from 'web3';
import { setEthereumAccount } from '../state/actions'

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
  appBar: {
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  fab: {
    margin: theme.spacing.unit,
  },
  extendedIcon: {
    marginRight: theme.spacing.unit,
  },
  list: {
    width: 250,
  },
});

class App extends Component {
  constructor(props) {
    super(props)
    const thisPersist = this;
    this.state = { userName: "", avatar: "", specificNetworkAddress: "", leftMenu: false }
    store.subscribe(() => {
      let reduxState = store.getState();
      console.log(reduxState);
      if(reduxState && reduxState.ethereumAccount){
        this.setState(reduxState.ethereumAccount);
      }
    })
    window.ethereum.on('accountsChanged', function (accounts) {
      if(thisPersist.state.specificNetworkAddress && (accounts[0] !== thisPersist.state.specificNetworkAddress)){
        window.location.reload();
      }
    })
  }

  componentDidUpdate() {
    if (web3 && web3.eth && web3.eth.getAccounts) {
      web3.eth.getAccounts((error, accounts) => {
        if (accounts.length > 0) {
          this.handleLogin();
        }
      })
    }
  }

  toggleDrawer = (menuType, open) => () => {
    this.setState({ [menuType]: open });
  };

  handleLogin = async (e) => {
    if (e) {
      e.preventDefault();
    }
    const identity = await initAccount();
    if (identity) {
      this.props.dispatch(setEthereumAccount({
        specificNetworkAddress: identity.address,
        userName: identity.address,
        avatar: identity.avatar
      }))
    }
  }

  handleLogout = async (e) => {
    e.preventDefault();
    this.setState({ userName: "", avatar: "", specificNetworkAddress: "" })
  }

  sideList(classes) {
    return <div className={classes.list}>
      <List>
          <ListItem button>
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText primary={"Home"} />
          </ListItem>
      </List>
    </div>
  }

  render() {
    let {classes} = this.props;
    return (
      
      <div style={{overflow: 'hidden'}}>
        <Drawer open={this.state.leftMenu} onClose={this.toggleDrawer('leftMenu', false)}>
          <div
            tabIndex={0}
            role="button"
            onClick={this.toggleDrawer('leftMenu', false)}
            onKeyDown={this.toggleDrawer('leftMenu', false)}
          >
            {this.sideList(classes)}
          </div>
        </Drawer>
        <div className={classes.appBar}>
          <AppBar position="static" className="our-gradient">
            <Toolbar>
              <IconButton onClick={this.toggleDrawer('leftMenu', true)} className={classes.menuButton} color="inherit" aria-label="Menu">
                <MenuIcon />
              </IconButton>
              <div className={classes.grow + " appbar-logo"}>
                <img src={philosophy0xLogo} alt="Philosophy0x Logo"></img>
              </div>
              {this.state.userName ?
                <React.Fragment>
                  <Typography className={classes.extendedIcon} variant="subtitle1" component="h3" color="inherit">
                  {this.state.userName}
                  </Typography>
                  <img style={{borderRadius: '30px'}} src={this.state.avatar.toDataURL()}/>
                </React.Fragment>
                : 
                <React.Fragment>
                  <Fab onClick={this.handleLogin} variant="extended" color="secondary" className={classes.fab + " bold"}>
                    <FingerprintIcon className={classes.extendedIcon} />SIGN IN
                  </Fab>
                </React.Fragment>
              }
              
            </Toolbar>
          </AppBar>
        </div>
        <Grid container spacing={24}>
          <Grid item xs={12} lg={12}>
            {this.state.userName ? (
              <Dashboard specificNetworkAddress={this.state.specificNetworkAddress} />
            ) : (
              <Grid item xs={12} className="login">
                  {window.ethereum && 
                    <Dashboard specificNetworkAddress={this.state.specificNetworkAddress} />
                  }
                  {!(window.ethereum && window.ethereum.isMetaMask) && 
                  <p className="text-large" style={{paddingLeft: '15px'}}>This app uses MetaMask for login and transaction approvals.
                      Download the MetaMask extension for your browser to begin. 
                  <a href="https://metamask.io/" rel="noopener noreferrer" target="_blank">https://metamask.io/</a>
                  </p>}
                </Grid >
              )}
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(connect()(App));