import blockies from 'blockies';
import { createIcon } from '@download/blockies';

const initAccount = async () => {
    if (typeof window.ethereum !== 'undefined') {
        let ethereum = window.ethereum;
        if(ethereum.isMetaMask){
            ethereum.enable();
            let avatar = await createIcon({
                seed: ethereum.selectedAddress,
                size: 15, // width/height of the icon in blocks, default: 8
                scale: 3, // width/height of each block in pixels, default: 4
                spotcolor: '#000'
            });
            return {address: ethereum.selectedAddress,
                    avatar: avatar};
        }
    }
}

export { initAccount }