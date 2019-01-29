import { createIcon } from '@download/blockies';
import Web3 from 'web3';

const initAccount = async () => {
    if (typeof window.ethereum !== 'undefined') {
        let ethereum = window.ethereum;
        if(ethereum.isMetaMask){
            ethereum.enable();
            let address = Web3.utils.toChecksumAddress(ethereum.selectedAddress);
            let avatar = await createIcon({
                seed: address,
                size: 15, // width/height of the icon in blocks, default: 8
                scale: 3, // width/height of each block in pixels, default: 4
                spotcolor: '#000'
            });
            return {
                address: address,
                avatar: avatar
            };
        }
    }
}

export { initAccount }