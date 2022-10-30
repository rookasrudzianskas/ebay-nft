import React, {useEffect, useState} from 'react';
import {useRouter} from "next/router";
import Header from "../../components/Header";
import {MediaRenderer, useContract, useListing} from "@thirdweb-dev/react";
import {UserCircleIcon} from "@heroicons/react/solid";
import {ListingType} from "@thirdweb-dev/sdk";
import Countdown from "react-countdown";

const ListingId = ({}) => {
    const router = useRouter();
    const {listingId} = router.query as { listingId: string };
    const { contract}  = useContract(process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT, 'marketplace');
    const {data: listing, isLoading, error } = useListing(contract, listingId);
    const [minimumNextBid, setMinimumNextBid] = useState<{
        displayValue: string;
        symbol: string;
    }>();

    const fetchMinNextBid = async () => {
        if(!listing || !contract) return;

        const { displayValue, symbol } = await contract.auction.getMinimumNextBid(listingId);
        setMinimumNextBid({
            displayValue: displayValue,
            symbol: symbol
        });
    }

    useEffect(() => {
        if(!listing || !contract || !listingId) return;
        if(listing.type === ListingType.Auction) {
            fetchMinNextBid();
        }
    }, [listing, listingId, contract]);

    const formatPlaceholder = () => {
        if(!listing) return;
        if(listing.type === ListingType.Direct) {
            return 'Enter Offer Amount'
        }

        if(listing.type === ListingType.Auction) {
            return Number(minimumNextBid?.displayValue) === 0 ? 'Enter Bid Amount' : `${minimumNextBid?.displayValue} ${minimumNextBid?.symbol} or more`;
        }
    }

    const createBidOrOffer = async () => {

    }

    if(isLoading) return (
        <div>
            <Header />
            <div className="text-center animate-pulse text-blue-500">
                <p>Loading Item...</p>
            </div>
        </div>
    )

    if(!listing) {
        return <p>Listing is not found</p>
    }
    return (
        <div>
            <Header />

            <main className="max-w-6xl mx-auto p-2 flex flex-col lg:flex-row space-y-10 space-x-5 pr-10">
                <div className="p-10 border mx-auto lg:mx-0 max-w-md lg:max-w-xl">
                    <MediaRenderer src={listing.asset.image} />
                </div>

                <section className="flex-1 space-y-5 pb-20 lg:pb-0">
                    <div>
                        <h1 className="text-xl font-bold">{listing.asset.name}</h1>
                        <p className="text-gray-600">{listing?.asset?.description}</p>
                        <p className="flex items-center text-sm sm:text-base ">
                            <UserCircleIcon className="h-5" />
                            <span className="font-bold pr-1">Seller: </span>{listing.sellerAddress}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 items-center py-2">
                        <p className="font-bold">
                            Listing Type:
                        </p>
                        <p className="">{listing.type === ListingType.Direct ? "Direct" : "Auction"}</p>
                        <p className="font-bold">Buy it Now Price:</p>
                        <p className="text-4xl font-bold">{listing.buyoutCurrencyValuePerToken.displayValue} {listing.buyoutCurrencyValuePerToken.symbol}</p>

                        <button className="col-start-2 mt-2 bg-blue-600 font-bold text-white rounded-full w-44 py-4 px-10">
                            Buy Now
                        </button>
                    </div>

                    <div className="grid grid-cols-2 space-y-3 items-center justify-end">
                        <hr className="col-span-2"/>

                        <p className="col-span-2 font-bold">{listing.type === ListingType.Direct ? "Make an Offer" : "Bid on this Auction"}</p>

                        {listing.type === ListingType.Auction && (
                            <>
                                <p>Current Minimum Bid:</p>
                                <p className="font-bold">{minimumNextBid?.displayValue} {minimumNextBid?.symbol}</p>
                                <p>Time Remaining:</p>
                                <Countdown date={Number(listing.endTimeInEpochSeconds.toString()) * 1000}  />
                            </>
                        )}

                        <input className="border p-2 rounded-lg mr-5 outline-green-500" type="text" placeholder={formatPlaceholder()}/>
                        <button onClick={createBidOrOffer} className="bg-red-600 font-bold text-white rounded-full w-44 py-4 px-10">{listing.type === ListingType.Direct ? "Offer" : "Bid"}</button>
                    </div>

                </section>
            </main>
        </div>
    );
};

export default ListingId;
// by Rokas with ❤️
