import React from 'react';
import {useRouter} from "next/router";
import Header from "../../components/Header";
import {MediaRenderer, useContract, useListing} from "@thirdweb-dev/react";

const ListingId = ({}) => {
    const router = useRouter();
    const {listingId} = router.query as { listingId: string };
    const { contract}  = useContract(process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT, 'marketplace');
    const {data: listing, isLoading, error } = useListing(contract, listingId);

    if(isLoading) return (
        <div>
            <Header />
            <div>
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

            <main>
                <div>
                    <MediaRenderer src={listing.asset.image} />
                </div>
            </main>
        </div>
    );
};

export default ListingId;
// by Rokas with ❤️
