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
    this.state = { userName: "", avatar: "", specificNetworkAddress: "", leftMenu: false }
  }

  componentDidMount() {
    this.handleLogin();
  }

  toggleDrawer = (menuType, open) => () => {
    this.setState({ [menuType]: open });
  };

  handleLogin = async (e) => {
    if (e) {
      e.preventDefault();
    }
    const identity = await initAccount();
    this.setState({
      specificNetworkAddress: identity.address,
      userName: identity.address,
      avatar: identity.avatar
    })
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
      
      <div className="App">
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
          <AppBar position="static">
            <Toolbar>
              <IconButton onClick={this.toggleDrawer('leftMenu', true)} className={classes.menuButton} color="inherit" aria-label="Menu">
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="h1" color="inherit" className={classes.grow}>
                Philosophy0x
              </Typography>
              {this.state.userName ?
                <React.Fragment>
                  <Typography className={classes.extendedIcon} variant="subtitle1" component="h3" color="inherit">
                  {this.state.userName}
                  </Typography>
                  <img style={{borderRadius: '30px'}} src={this.state.avatar.toDataURL()}/>
                  <Fab onClick={this.handleLogout} variant="extended" color="secondary" className={classes.fab}>
                    <FingerprintIcon className={classes.extendedIcon} />Log Out
                  </Fab>
                </React.Fragment>
                : <Fab onClick={this.handleLogin} variant="extended" color="secondary" className={classes.fab}>
                <FingerprintIcon className={classes.extendedIcon} />Login
              </Fab>
              }
              
            </Toolbar>
          </AppBar>
        </div>
        <Grid container spacing={24}>
          <Grid item xs={12}>
            {this.state.userName ? (
              <Dashboard specificNetworkAddress={this.state.specificNetworkAddress} />
            ) : (
              <Grid item xs={12} className="login">
                  {!(window.ethereum && window.ethereum.isMetaMask) && <p className="text-large">This app uses MetaMask for login and transaction approvals.
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

export default withStyles(styles)(App);