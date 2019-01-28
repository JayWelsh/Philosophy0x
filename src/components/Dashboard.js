import React, { Component } from 'react'
import { setJSON, getJSON } from '../util/IPFS.js'
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Loader from "./Loader"
import { createPhilosophyHash, getPhilosopherPhilosophyIds, getPhilosophyById } from '../services/Philosophy0x';
import { throws } from 'assert';

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    input: {
        display: 'none',
    },
    paper: {
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit ,
    },
    root: {
        flexGrow: 1,
        padding: theme.spacing.unit * 2
    },
});

export class Dashboard extends Component {
    constructor() {
        super();
        this.state = {
            myData: "",
            philosophyList: [],
            timestamp: "",
            loading: false,
            philosophyIdList: [],
        }
    }
    componentDidMount = async () => {
        this.fetchData()
    }
    handleSubmit = async (e) => {
        e.preventDefault();
        this.setState({ loading: true });
        const hash = await setJSON({ myData: this.state.myData });
        try {
            await createPhilosophyHash(this.props.specificNetworkAddress, hash);
        } catch (error) {
            this.setState({ loading: false });
            alert("There was an error with the transaction.");
            return;
        }
        this.fetchData();
    }
    fetchData = async () => {
        //first get hash from smart contract
        const philosophyIds = await getPhilosopherPhilosophyIds(this.props.specificNetworkAddress);
        if(philosophyIds.length > 0){
            let philosophyOfPhilosopher = [];
            for(let philosophyIdBN of philosophyIds){
                let decodedPhilosophyId = parseInt(philosophyIdBN);
                if (this.state.philosophyIdList.indexOf(decodedPhilosophyId) === -1) {
                    const philosophyItem = await getPhilosophyById(decodedPhilosophyId);
                    //then get data off IPFS
                    const ipfsHash = philosophyItem[1];
                    if (!ipfsHash) { return }
                    const timestamp = philosophyItem[3].toString();
                    const details = await getJSON(ipfsHash);
                    this.setState({
                        philosophyList: [...this.state.philosophyList, details],
                        philosophyIdList: [...this.state.philosophyIdList, decodedPhilosophyId],
                        loading: false,
                        timestamp
                    })
                }
            }
        }  
    }
    handleMyData = (e) => {
        this.setState({ myData: e.target.value });
    }

    render() {
        let {classes} = this.props;
        console.log('this.state',this.state);
        return (
            <React.Fragment>
                <div className={classes.root}>
                    <Grid container spacing={24}>
                        <Grid item xs={false} sm={false} md={3} lg={3} className={"disable-padding"}>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={6}>
                            {this.state.timestamp ?
                                <p>Data loaded from Ethereum / IPFS: <br />Time saved to block: {new Date(Number(this.state.timestamp + "000")).toUTCString()}</p>
                                :
                                <div><h4>No philosophy found on this account.</h4><p>Improve the silence.</p></div>
                            }
                            {this.state.philosophyList.map((item, index) => {
                                return (<Paper className={classes.paper} key={index}>
                                    {item.myData}
                                </Paper>);
                            })}
                        </Grid>
                        <Grid item xs={false} sm={false} md={3} lg={3} className={"disable-padding"}>
                        </Grid>
                        <Grid item xs={false} sm={false} md={3} lg={3} className={"disable-padding"}>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={6}>
                            <form onSubmit={this.handleSubmit}>
                                <TextField
                                    id="standard-multiline-flexible"
                                    label="In accordance with nature"
                                    multiline
                                    rowsMax="4"
                                    onChange={this.handleMyData}
                                    className={classes.textField}
                                    margin="normal"
                                    style={{ width: '100%' }}
                                />
                                <br />
                                <Button type="submit" variant="contained" color="primary" className={classes.button}>
                                    Create Philosophy
                        </Button>
                            </form>
                        </Grid>
                        <Grid item xs={false} sm={false} md={3} lg={3} className={"disable-padding"}>
                        </Grid>
                        {this.state.loading &&
                            <Loader />
                        }
                    </Grid>
                </div>
            </React.Fragment>
        )
    }
}

export default withStyles(styles)(Dashboard);
