import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Header from "../components/Header";

const Home: NextPage = () => {
  return (
    <div className="">
      <Head>
        <title>Ebay</title>
        <link rel="icon" href="https://cdn-icons-png.flaticon.com/512/5977/5977581.png" />
      </Head>


        <Header />

    </div>
  )
}

export default Home;
