import React, {FormEvent, useState} from 'react';
import Header from "../components/Header";
import {useRouter} from "next/router";
import {
    MediaRenderer,
    useAddress,
    useContract, useCreateAuctionListing,
    useCreateDirectListing,
    useNetworkMismatch,
    useOwnedNFTs
} from "@thirdweb-dev/react";
import {NATIVE_TOKEN_ADDRESS, NFT} from "@thirdweb-dev/sdk";
import {useNetwork} from "wagmi";
import network from "../utils/network";

type Props = {

}

const Create = ({}: Props) => {
    const router = useRouter();
    const address = useAddress();
    const { contract } = useContract(process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT, 'marketplace');
    const { contract: collectionContract } = useContract(process.env.NEXT_PUBLIC_COLLECTION_CONTRACT, 'nft-collection');
    const [selectedNft, setSelectedNft] = useState<NFT>();
    const { mutate: createDirectListing, isLoading, error } = useCreateDirectListing(contract);
    const { mutate: createAuctionListing, isLoading: isLoadingAuction, error: errorAuction } = useCreateAuctionListing(contract);

    const ownedNfts = useOwnedNFTs(collectionContract, address);
    const networkMismatch = useNetworkMismatch();
    const [, switchNetwork] = useNetwork();

    const handleCreateListing = async (e: FormEvent<HTMLFormElement> ) => {
        e.preventDefault();
        if(networkMismatch) {
            // switch to the correct network
            switchNetwork && await switchNetwork(network);
            return;
        }
        if(!selectedNft) return;

        const target = e.target as typeof e.target & {
            elements: { listingType: { value: string }, price: { value: string } };
        }

        const { listingType, price } = target.elements;

        if( listingType.value === 'directListing') {
            await createDirectListing({
                // @ts-ignore
                assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT, // the address of the NFT contract
                tokenId: selectedNft.metadata.id, // the ID of the NFT
                currencyContractAddress: NATIVE_TOKEN_ADDRESS, // the address of the currency contract
                listingDurationInSeconds: 60 * 60 * 24 * 7, // the duration of the listing in seconds
                quantity: 1, // the quantity of the NFT to list
                buyoutPricePerToken: price.value, // the price of the NFT
                startTimestamp: new Date() // the start time of the listing
            }, {
                onSuccess: (data, variables, context) => {
                    console.log("SUCCESS >>>", data, variables, context);
                    router.push('/');
                },
            });
        }
    }

    return (
        <div>
            <Header />

            <main className="max-w-6xl mx-auto p-10 pt-2">
                <h1 className="text-4xl font-bold">List an Item</h1>
                <h2 className="text-xl font-semibold pt-5">Select an Item you would like to Sell</h2>

                <hr className="my-5 "/>

                <p>Below you will find the NFT's you own in your wallet</p>

                <div className="flex  overflow-x-scroll space-x-2 p-4">
                    {ownedNfts?.data?.map((nft, i) => (
                        <div onClick={() => setSelectedNft(nft)} key={nft.metadata.id} className={`flex flex-col space-y-2 card min-w-fit border-2 bg-gray-100 ${nft.metadata.id === selectedNft?.metadata.id ? 'border-black': 'border-transparent'}`}>
                            <MediaRenderer className="h-48 rounded-lg" src={nft.metadata.image} />
                            <p className="text-lg truncate font-bold">{nft?.metadata?.name}</p>
                            <p className="text-xs truncate">{nft?.metadata?.description}</p>
                        </div>
                        ))}
                </div>

                {selectedNft && (
                    <form onSubmit={handleCreateListing} action="">
                        <div className="flex flex-col p-10">
                            <div className="grid grid-cols-2 gap-5">
                                <label className="border-r font-light" htmlFor="" >Direct Listing / Fixed Price</label>
                                <input type="radio" name="listingType" className="ml-auto w-10 h-10" value="directListing"/>

                                <label className="border-r font-light" htmlFor="" >Auction</label>
                                <input type="radio" name="listingType" className="ml-auto w-10 h-10" value="auctionListing"/>

                                <label className="border-r font-light" htmlFor="">Price</label>
                                <input name="price" type="text" placeholder="0.05" className="bg-gray-100 p-5 outline-none"/>

                            </div>
                                <button className="bg-blue-600 text-white rounded-lg p-4 mt-8 font-bold" type="submit">Create Listing</button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
};

export default Create;
// by Rokas with ❤️
