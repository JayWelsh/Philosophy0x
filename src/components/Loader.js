import React from 'react';

const Loader = () => {
    return (
        <div className="outerLoader">
            <div className="loader"></div>
            <h4>Please approve this transaction via MetaMask.<br />Saving permanently to the blockchain.<br />This transaction may take a few minutes.</h4>
        </div>
    );
};

export default Loader;