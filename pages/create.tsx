import React from 'react';
import Header from "../components/Header";
import {useRouter} from "next/router";
import {useAddress, useContract, useOwnedNFTs} from "@thirdweb-dev/react";

type Props = {

}

const Create = ({}: Props) => {
    const router = useRouter();
    const address = useAddress();
    const { contract } = useContract(process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT, 'marketplace');
    const { contract: collectionContract } = useContract(process.env.NEXT_PUBLIC_COLLECTION_CONTRACT, 'nft-collection');

    const ownedNfts = useOwnedNFTs(collectionContract, address);

    return (
        <div>
            <Header />

            <main className="max-w-6xl mx-auto p-10 pt-2">
                <h1 className="text-4xl font-bold">List an Item</h1>
                <h2 className="text-xl font-semibold pt-5">Select an Item you would like to Sell</h2>

                <hr className="my-5 "/>

                <p>Below you will find the NFT's you own in your wallet</p>
            </main>
        </div>
    );
};

export default Create;
// by Rokas with ❤️
