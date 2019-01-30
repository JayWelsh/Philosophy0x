import React, { Component } from 'react'
import { setJSON, getJSON } from '../util/IPFS.js'
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Loader from "./Loader"
import Typography from '@material-ui/core/Typography';
import { createPhilosophyHash, getPhilosopherPhilosophyIds, getPhilosophyById, getPhilosophyCount, editPhilosophyAddNewHash, getPhilosophyRevisionIds, getPhilosophyRevisionById } from '../services/Philosophy0x';
import { createIcon } from "@download/blockies";
import Fab from '@material-ui/core/Fab';
import EditIcon from '@material-ui/icons/Edit';

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
    },
    itemBottomMargin: {
        marginBottom: theme.spacing.unit,
    },
    itemMarginLeft: {
        marginLeft: theme.spacing.unit,
    },
    root: {
        flexGrow: 1,
        padding: theme.spacing.unit * 2,
    },
    publicAddress: {
        display: 'inline-block',
        position: 'relative',
        verticalAlign: 'top',
        top: '12px',
        paddingLeft: theme.spacing.unit,
    },
    publicPhilosopherContainer: {
        marginBottom: theme.spacing.unit,
    },
});

export class Dashboard extends Component {

    _isMounted = false;

    constructor() {
        super();
        this.state = {
            myData: "",
            publicPhilosophy: [],
            publicPhilosophyIdList: [],
            philosophyList: [],
            timestamp: "",
            loading: false,
            philosophyIdList: [],
            createMode: true,
            editMode: false,
            editData: {},
        }
    }
    componentDidMount = async () => {
        this._isMounted = true;
        if (this._isMounted) {
            this.fetchData()
        }
    }
    setEditMode(data) {
        this.setState({
            createMode: false,
            editMode: true,
            editData: data
        })
    }
    setCreateMode() {
        this.setState({
            createMode: true,
            editMode: false,
        })
    }
    componentWillUnmount = async () => {
        this._isMounted = false;
    }
    handleSubmit = async (e) => {
        e.preventDefault();
        if (this.state.myData && (this.state.myData.length > 0)) {
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
        } else {
            alert("Empty records not allowed!");
        }
    }
    replaceEditedRecord(philosophyEditedId, philosophyRevisedText){
        if (this.state.philosophyList.length > 0) {
            let tripWire = false;
            let newPhilosophyList = this.state.philosophyList.map((item) => {
                if (item.text && item.revisionCount && (item.id === philosophyEditedId)) {
                    item.text = philosophyRevisedText;
                    item.revisionCount++;
                    tripWire = true;
                    return item;
                } else {
                    return item;
                }
            });
            if(tripWire){
                this.setState({philosophyList: newPhilosophyList, loading: false, editMode: false, createMode: true, editData: {}});
            }else{
                this.setState({loading: false})
            }
        }
    }
    handleEditSubmit = async (e) => {
        e.preventDefault();
        const philosophyRevisedText = this.state.myData;
        const philosophyRevisionId = this.state.editData.id;
        if (philosophyRevisedText !== this.state.editData.text) {
            this.setState({ loading: true });
            const hash = await setJSON({ text: philosophyRevisedText });
            try {
                if (philosophyRevisedText.length > 0) {
                    if (philosophyRevisedText && (philosophyRevisionId >= 0)) {
                        let philosophyEditTransaction = await editPhilosophyAddNewHash(this.props.specificNetworkAddress, hash, philosophyRevisionId);
                        if (philosophyEditTransaction.receipt.status === true) {
                            this.replaceEditedRecord(philosophyRevisionId, philosophyRevisedText);
                        }
                    }
                } else {
                    throw new Error("No edit data provided. No empty edits.");
                }
            } catch (error) {
                this.setState({ loading: false });
                alert("There was an error with the transaction.");
                return;
            }
        } else {
            alert("Revision is the same as existing record!");
        }
    }
    fetchData = async () => {
        //first get hash from smart contract
        if (this.props.specificNetworkAddress) {
            const philosophyIds = await getPhilosopherPhilosophyIds(this.props.specificNetworkAddress);
            if (philosophyIds.length > 0) {
                let philosophyOfPhilosopher = [];
                for (let philosophyIdBN of philosophyIds) {
                    let decodedPhilosophyId = parseInt(philosophyIdBN);
                    if (this.state.philosophyIdList.indexOf(decodedPhilosophyId) === -1) {
                        let revisionCount = 0;
                        let philosophyItem = await getPhilosophyById(decodedPhilosophyId);
                        const philosophyRevisionResponse = await this.getLatestPhilosophyRevision(decodedPhilosophyId);
                        if (philosophyRevisionResponse && philosophyRevisionResponse.philosophyItem) {
                            philosophyItem = philosophyRevisionResponse.philosophyItem
                            revisionCount = philosophyRevisionResponse.revisionCount ? philosophyRevisionResponse.revisionCount : revisionCount;
                        }
                        //then get data off IPFS
                        const ipfsHash = philosophyItem[1];
                        if (!ipfsHash) { return }
                        const timestamp = philosophyItem[3].toString();
                        const details = {};
                        let ipfsResponse = await getJSON(ipfsHash);
                        details.text = ipfsResponse.myData ? ipfsResponse.myData : ipfsResponse.text;
                        details.id = decodedPhilosophyId;
                        details.revisionCount = revisionCount;
                        if (this._isMounted) {
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
        }
        await this.getPublicPhilosophy();
    }

    getPublicPhilosophy = async () => {
        //Get public philsophy
        let publicPhilosophyCount = await getPhilosophyCount();
        if(publicPhilosophyCount > 0){
            if(publicPhilosophyCount > 50) {
                publicPhilosophyCount = 50; //Limit for now
            }
            for(let i = 0; i < publicPhilosophyCount; i++){
                if ((this.state.publicPhilosophyIdList.indexOf(i) === -1) && (this.state.philosophyIdList.indexOf(i) === -1)) {
                    let revisionCount = 0;
                    let philosophyItem = await getPhilosophyById(i);
                    const philosophyRevisionResponse = await this.getLatestPhilosophyRevision(i);
                    if (philosophyRevisionResponse && philosophyRevisionResponse.philosophyItem) {
                        philosophyItem = philosophyRevisionResponse.philosophyItem
                        revisionCount = philosophyRevisionResponse.revisionCount ? philosophyRevisionResponse.revisionCount : revisionCount;
                    }
                    //then get data off IPFS
                    const ipfsHash = philosophyItem[1];
                    if (!ipfsHash) { return }
                    const details = {};
                    let ipfsResponse = await getJSON(ipfsHash);
                    details.text = ipfsResponse.myData ? ipfsResponse.myData : ipfsResponse.text;
                    const address = philosophyItem[0];
                    if (!window.ethereum || !window.ethereum.selectedAddress || (address.toLowerCase() !== window.ethereum.selectedAddress.toLowerCase())) {
                        const avatar = await createIcon({
                            seed: address,
                            size: 15, // width/height of the icon in blocks, default: 8
                            scale: 3, // width/height of each block in pixels, default: 4
                            spotcolor: '#000'
                        });
                        const publicPhilosophyItem = { address: address, text: details.text, avatar: avatar, revisionCount: revisionCount }
                        if (this._isMounted) {
                            this.setState({
                                publicPhilosophy: [...this.state.publicPhilosophy, publicPhilosophyItem],
                                publicPhilosophyIdList: [...this.state.publicPhilosophyIdList, i],
                            })
                        }
                    }
                }
            }
        }
    }

    getLatestPhilosophyRevision = async (basePhilosophyId) => {
        const philosophyRevisionsResponse = await getPhilosophyRevisionIds(basePhilosophyId);
        if (philosophyRevisionsResponse.length > 0) {
            const philosophyRevisionsList = philosophyRevisionsResponse.toString().split(",").map((item) => item * 1);
            if (philosophyRevisionsList.length > 0) {
                const philosophyRevisionsListSortedDescending = philosophyRevisionsList.sort((a, b) => {
                    return b - a;
                });
                const latestRevisionId = philosophyRevisionsListSortedDescending[0];
                const philosophyItem = await getPhilosophyRevisionById(latestRevisionId);
                return {philosophyItem: philosophyItem, revisionCount: philosophyRevisionsList.length};
            }
        }
    }

    handleMyData = (e) => {
        this.setState({ myData: e.target.value });
    }

    render() {
        let {classes} = this.props;
        return (
            <React.Fragment>
                <div className={classes.root}>
                    <Grid container spacing={24}>
                        {this.props.specificNetworkAddress &&
                            <React.Fragment>
                                <Grid item xs={false} sm={false} md={3} lg={3} className={"disable-padding"}>
                                </Grid>
                                <Grid item xs={12} sm={12} md={6} lg={6}>
                                    {this.state.timestamp ?
                                        <p>Data loaded from Ethereum / IPFS: <br />Time saved to block: {new Date(Number(this.state.timestamp + "000")).toUTCString()}</p>
                                        :
                                        <div>
                                            <Typography variant="h6" component="h4" color="inherit">
                                                No philosophy found on this account.
                                    </Typography>
                                            <Typography variant="subtitle1" component="p" color="inherit">
                                                Improve the silence.
                                    </Typography>
                                        </div>
                                    }
                                    {this.state.philosophyList.map((item, index) => {
                                    return (
                                    <div className={"flex"} key={index}>
                                        <div className={"flex flex-grow " + classes.itemBottomMargin}>
                                            <Paper className={classes.paper + " flex-grow"}>
                                                {item.text}
                                            </Paper>
                                            <Fab onClick={() => this.setEditMode({ id: item.id, text: item.text })} color="primary" aria-label="Revise Philosophy" size="small" className={classes.fab + " vertical-align " + classes.itemMarginLeft}>
                                                <EditIcon />
                                            </Fab>
                                        </div>
                                    </div>);
                                    })}
                                </Grid>
                                <Grid item xs={false} sm={false} md={3} lg={3} className={"disable-padding"}>
                                </Grid>
                                <Grid item xs={false} sm={false} md={3} lg={3} className={"disable-padding"}>
                                </Grid>
                                <Grid item xs={12} sm={12} md={6} lg={6}>
                                {this.state.createMode && <form onSubmit={this.handleSubmit}>
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
                                </form>}
                                {this.state.editMode && this.state.editData && <form onSubmit={this.handleEditSubmit}>
                                    <TextField
                                        id="standard-multiline-flexible"
                                        label="In accordance with nature"
                                        multiline
                                        rowsMax="4"
                                        onChange={this.handleMyData}
                                        className={classes.textField}
                                        margin="normal"
                                        defaultValue={this.state.editData.text}
                                        style={{ width: '100%' }}
                                    />
                                    <br />
                                    <Button type="submit" variant="contained" color="primary" className={classes.button}>
                                        Edit Record (Public Revision)
                                    </Button>
                                    <Button onClick={() => this.setCreateMode()} variant="contained" color="secondary" className={classes.button}>
                                        Cancel Edit
                                    </Button>
                                </form>}
                                </Grid>
                                <Grid item xs={false} sm={false} md={3} lg={3} className={"disable-padding"}>
                                </Grid>
                            </React.Fragment>
                        }
                        {this.state.publicPhilosophy &&
                            <React.Fragment>
                                <Grid item xs={false} sm={false} md={3} lg={3} className={"disable-padding"}>
                                </Grid>
                                <Grid item xs={12} sm={12} md={6} lg={6}>
                                <Typography variant="h6" component="h4" color="inherit">
                                    Inspiration from others
                                </Typography>
                                    {this.state.publicPhilosophy.map((item, index) => {
                                        return (
                                        <Paper className={classes.paper + " " + classes.itemBottomMargin} key={index}>
                                            <div className={classes.publicPhilosopherContainer}>
                                            <img style={{borderRadius: '30px',display:'inline-block'}} src={item.avatar.toDataURL()}/>
                                            <Typography className={classes.publicAddress} variant="subtitle1" component="h3" color="inherit">
                                                {item.address}
                                            </Typography>
                                            </div>
                                            <Typography variant="subtitle1" component="h3" color="inherit">
                                            {item.text}
                                            </Typography>
                                        </Paper>);
                                    })}
                                </Grid>
                                <Grid item xs={false} sm={false} md={3} lg={3} className={"disable-padding"}>
                                </Grid>
                            </React.Fragment>
                        }
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
