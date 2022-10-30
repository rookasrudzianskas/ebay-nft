import React, {useEffect, useState} from 'react';
import {useRouter} from "next/router";
import Header from "../../components/Header";
import {
    MediaRenderer, useAcceptDirectListingOffer, useAddress,
    useBuyNow,
    useContract,
    useListing, useMakeBid,
    useMakeOffer,
    useNetwork,
    useNetworkMismatch, useOffers
} from "@thirdweb-dev/react";
import {UserCircleIcon} from "@heroicons/react/solid";
import {ListingType, NATIVE_TOKENS} from "@thirdweb-dev/sdk";
import Countdown from "react-countdown";
import network from "../../utils/network";
import {ethers} from "ethers";
import toast from "react-hot-toast"


const ListingId = ({}) => {
    const router = useRouter();
    const address = useAddress();
    const {listingId} = router.query as { listingId: string };
    const { contract}  = useContract(process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT, 'marketplace');
    const {data: listing, isLoading, error } = useListing(contract, listingId);

    const [, switchNetwork] = useNetwork();
    const networkMismatch = useNetworkMismatch();

    const {mutate: buyNow, isLoading: isBuyNowLoading, error: isError} = useBuyNow(contract);
    const {mutate: makeOffer } = useMakeOffer(contract);
    // const offers = useOffers(contract, listingId);
    const { data: offers } = useOffers(contract, listingId)
    const { mutate: makeBid } = useMakeBid(contract);
    const { mutate: acceptOffer } = useAcceptDirectListingOffer(contract)

    const [bidAmount, setBidAmount] = useState("");
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

    const buyNft = async () => {
        if (!address) {
            toast.error("Connect your wallet!")
            return
        }
        const notification = toast.loading("Buying NFT...")

        if(networkMismatch) {
            switchNetwork && switchNetwork(network);
            return;
        }

        if(!listing || !contract || !listingId) return;

        await buyNow({
            id: listingId,
            buyAmount: 1,
            type: listing.type,
        }, {
            onSuccess: (data, variables, context) => {
                toast.success("NFT bought successfully!", {
                    id: notification,
                })
                console.log("SUCCESS: ", data, variables, context)
                router.replace("/");
            },
            onError: (error, variables, context) => {
                toast.error("Whoops something went wrong!", {
                    id: notification,
                })
                console.log("ERROR: ", error, variables, context)
            }
        });

    }

    const createBidOrOffer = async () => {
        if (!address) {
            toast.error("Connect your wallet!")
            return
        }
        const notification = toast.loading("Placing Bid... ")

        try {
            if(networkMismatch) {
                switchNetwork && switchNetwork(network);
                return;
            }

            // Handle the direct listing
            if(listing?.type === ListingType.Direct) {
                if(listing.buyoutPrice.toString() === ethers.utils.parseEther(bidAmount).toString()) {
                    toast.loading("Buyout Price met, buying NFT...!", {
                        id: notification,
                    })
                    console.log("Buyout Price met, buying NFT...")
                    buyNft()
                    return;
                }

                toast.loading("Buyout price not met, making offer...!", {
                    id: notification,
                })

                console.log("Buyout price not met, making offer...")
                await makeOffer(
                    {
                        quantity: 1,
                        listingId,
                        pricePerToken: bidAmount,
                    },
                    {
                        onSuccess(data, variables, context) {
                            toast.success("Offer made successfully!", {
                                id: notification,
                            })
                            console.log("SUCCESS: ", data, variables, context)
                            setBidAmount("")
                        },
                        onError(error, variables, context) {
                            toast.error("Whoops something went wrong!", {
                                id: notification,
                            })
                            console.log("ERROR: ", error, variables, context)
                        },
                    }
                )
            }

            // Handle the auction listing
            if(listing?.type === ListingType.Auction) {
                console.log("Making bid...");
                await makeBid({
                   listingId,
                   bid: bidAmount,
                }, {
                    onSuccess(data, variables, context) {
                        toast.success("Bid made successfully", {
                            id: notification,
                        })
                        console.log("SUCCESS: ", data, variables, context)
                        setBidAmount("")
                    },
                    onError(error, variables, context) {
                        toast.error("Whoops something went wrong!", {
                            id: notification,
                        })
                        console.log("ERROR: ", error, variables, context)
                    },
                });
            }
        } catch (e) {
            console.log(e);
        }
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

                        <button onClick={buyNft} className="col-start-2 mt-2 bg-blue-600 font-bold text-white rounded-full w-44 py-4 px-10">
                            Buy Now
                        </button>
                    </div>

                    {listing.type === ListingType.Direct && offers && (
                        <div className="grid grid-cols-2 gap-y-2">
                            <p className="font-bold">Offers: </p>
                            <p>{offers.length > 0 ? offers.length : 0}</p>

                            {offers.map((offer, index) => (
                                <>
                                    <p className="flex items-center ml-5 text-sm italic">
                                        <UserCircleIcon className="h-3 mr-2" />
                                        {offer.offeror.slice(0, 5) + "..." + offer.offeror.slice(-5)}
                                    </p>
                                    <div
                                        key={
                                            offer.listingId +
                                            offer.offeror +
                                            offer.totalOfferAmount.toString()
                                        }
                                    >
                                        <p
                                            className="text-sm italic">
                                            {ethers.utils.formatEther(offer.totalOfferAmount)}{" "}
                                            {NATIVE_TOKENS[network].symbol}
                                        </p>

                                        {listing.sellerAddress === address && (
                                            <button
                                                // @ts-ignore
                                                onClick={() => {
                                                    if (!address) {
                                                        toast.error("Connect your wallet!")
                                                        return
                                                    }
                                                    const notification =
                                                        toast.loading("Placing Offer... ")
                                                    acceptOffer({
                                                        listingId,
                                                        addressOfOfferor: offer.offeror,
                                                    }, {
                                                        onSuccess(data, variables, context) {
                                                            toast.success(
                                                                "Offer accepted successfully",
                                                                {
                                                                    id: notification,
                                                                }
                                                            )
                                                            console.log(
                                                                "SUCCESS: ",
                                                                data,
                                                                variables,
                                                                context
                                                            )
                                                            router.replace("/")
                                                        },
                                                        onError(error, variables, context) {
                                                            toast.error(
                                                                "Whoops something went wrong!",
                                                                {
                                                                    id: notification,
                                                                }
                                                            )

                                                            console.log(
                                                                "ERROR: ",
                                                                error,
                                                                variables,
                                                                context
                                                            )
                                                        }
                                                    })
                                                }}
                                                className="p-2 w-32 bg-red-500/50 rounded-lg font-bold text-xs cursor-pointer">
                                                Accept Offer
                                            </button>
                                        )}


                                    </div>
                                </>
                            ))}
                        </div>
                    )}

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

                        <input onChange={(e) => setBidAmount(e.target.value)} className="border p-2 rounded-lg mr-5 outline-green-500" type="text" placeholder={formatPlaceholder()}/>
                        <button onClick={createBidOrOffer} className="bg-red-600 font-bold text-white rounded-full w-44 py-4 px-10">{listing.type === ListingType.Direct ? "Offer" : "Bid"}</button>
                    </div>

                </section>
            </main>
        </div>
    );
};

export default ListingId;
// by Rokas with ❤️
