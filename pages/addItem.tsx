import React, {FormEvent, useState} from 'react';
import Header from "../components/Header";
import {useAddress, useContract} from "@thirdweb-dev/react";
import {File} from "@babel/types";

type Props = {

}

const AddItem = ({}: Props) => {
    const { contract } = useContract(process.env.NEXT_PUBLIC_COLLECTION_CONTRACT, 'nft-collection');
    const address = useAddress();
    const [preview, setPreview] = useState<string>();
    const [image, setImage] = useState<File>();

    const mintNft = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!contract || !address) return;

        if(!image) {
            alert("Please select an image");
            return;
        }

        const target = e.target as typeof e.target & {
            name: { value: string };
            description: { value: string };
        }

        const metadata = {
            name: target.name.value,
            description: target.description.value,
            image: image, // image URL, or a File object
        }

        try {
              const tx = await contract.mintTo(address, metadata);
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <div>
            <Header />

            <main className="max-w-6xl mx-auto p-10 border">
                <h1 className="text-4xl font-bold">Add an item to the Marketplace</h1>
                <h2 className="text-xl font-semibold pt-5">Item Details</h2>
                <p className="pb-5">
                    By adding an item to the marketplace, you agree to the terms and conditions of the marketplace.
                    NFT items are non-fungible, meaning that each item is unique. You will not be able to remove an item
                    from the marketplace once it has been added.
                </p>

                <div className="flex flex-col justify-center md:flex-row md:items-center md:space-x-5 pt-5">
                    <img className="border h-80 w-80 object-contain" src="https://links.papareact.com/ucj" alt=""/>

                    <form onSubmit={mintNft} className="flex flex-col flex-1 p-2 space-y-2">
                        <label className="font-light">Name of Item</label>
                        <input id="name" name="name" className="formField" type="text" placeholder={'Name of item...'}/>

                        <label className="font-light">Description</label>
                        <input id="description" name="description" className="formField" type="text" placeholder={'Enter Description...'}/>

                        <label className="font-light">Image</label>
                        <input className="" type="file" onChange={(e) => {
                            if(e.target.files?.[0]) {
                                setPreview(URL.createObjectURL(e.target.files[0]));
                                // @ts-ignore
                                setImage(e.target.files[0]);
                            }
                        }} />

                        <button type={'submit'} className="bg-blue-600 font-bold text-white rounded-full py-4 px-10 w-56 mx-auto mt-5 md:mt-auto md:ml-auto">
                            Add/Mint Item
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AddItem;
// by Rokas with ❤️
