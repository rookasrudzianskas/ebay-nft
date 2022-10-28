import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Header from "../components/Header";
import {useActiveListings, useContract} from "@thirdweb-dev/react";

const Home: NextPage = () => {
    const { contract } = useContract(process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT, 'marketplace');

    const { data: listings, isLoading: loadingListings } = useActiveListings(contract);
    console.log(listings);

  return (
    <div className="">
      <Head>
        <title>Ebay</title>
        <link rel="icon" href="https://cdn-icons-png.flaticon.com/512/5977/5977581.png" />
      </Head>


        <Header />

        <main>
            {loadingListings ? (
                <p>Loading listings...</p>
            ) : (
                <div>
                    Listings
                </div>
            )}
        </main>

    </div>
  )
}

export default Home;
