import React from 'react';
import Header from "../components/Header";
import {useRouter} from "next/router";
import {useAddress, useContract} from "@thirdweb-dev/react";

type Props = {

}

const Create = ({}: Props) => {
    const router = useRouter();
    const address = useAddress();
    const { contract } = useContract(process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT, 'marketplace');

    return (
        <div>
            <Header />
        </div>
    );
};

export default Create;
// by Rokas with ❤️
