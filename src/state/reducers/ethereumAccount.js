const ethereumAccount = (state = {
    specificNetworkAddress: "",
    userName: "",
    avatar: ""
}, action) => {
    switch (action.type) {
        case 'LOG_IN':
            if (action.account) {
                const newState = Object.assign(state, action.account);
                return newState;
            }
        default:
            return state;
    }
}

export default ethereumAccount;