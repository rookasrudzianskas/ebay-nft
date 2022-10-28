import React from 'react';
import {useAddress, useDisconnect, useMetamask} from "@thirdweb-dev/react";

type Props = {

}

const Header = ({}: Props) => {
    const connectWithMetaMask = useMetamask();
    const disconnect = useDisconnect();
    const address = useAddress();


    return (
        <div>
            <nav>
                <div>
                    {address ? (
                        <button onClick={disconnect} className="connectWalletButton">
                            Hi, {address}
                        </button>
                    ) : (
                        <button onClick={connectWithMetaMask} className="connectWalletButton">
                            Connect your wallet
                        </button>
                    )}

                </div>
            </nav>
        </div>
    );
};

export default Header;
// by Rokas with ❤️
