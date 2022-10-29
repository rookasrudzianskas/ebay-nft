import React from 'react';
import {useRouter} from "next/router";

const ListingId = ({}) => {
    const router = useRouter();
    const {listingId} = router.query as { listingId: string };
    return (
        <div>
            <h1>Listing ID: {listingId}</h1>
        </div>
    );
};

export default ListingId;
// by Rokas with ❤️
