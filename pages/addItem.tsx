import React from 'react';
import Header from "../components/Header";
import {useContract} from "@thirdweb-dev/react";

type Props = {

}

const AddItem = ({}: Props) => {
    const { contract } = useContract(process.env.NEXT_PUBLIC_COLLECTION_CONTRACT, 'nft-collection');
    return (
        <div>
            <Header />
        </div>
    );
};

export default AddItem;
// by Rokas with ❤️
