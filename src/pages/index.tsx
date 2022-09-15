import { Clock, Wallet1 } from 'iconsax-react'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import DiscourseLongList from '../components/cards/DiscourseLongList'
import Layout from '../components/layout/Layout'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLazyQuery, useQuery } from '@apollo/client'
import { GET_DISCOURSES, GET_DISCOURSES_BY_CHAIN } from '../lib/queries'
import LoadingSpinner from '../components/utils/LoadingSpinner'
import ConnectWalletDailog from '../components/dialogs/ConnectWalletDailog'
import TopBar from '../components/topbar/TopBar'
import BDecoration from '../components/utils/BDecoration'
import AppContext from '../components/utils/AppContext'
import { useNetwork } from 'wagmi'
import { supportedChainIds } from '../Constants'
import { ToastTypes } from '../lib/Types'
import { uuid } from 'uuidv4'
import HeroCard from '../components/actions/HeroCard'

const Home: NextPage = () => {
	const route = useRouter();
	const { loggedIn, addToast } = useContext(AppContext);

	const [openConnectWallet, setOpenConnectWallet] = useState(false);
	const [ showAll, setShowAll ] = useState(false);

	const { loading: dLoading, error: dError, data: dData } = useQuery(GET_DISCOURSES_BY_CHAIN, {
		variables: {
			chainId: supportedChainIds[0]
		}
	});
	
	const [refetch] = useLazyQuery(GET_DISCOURSES);
	const { activeChain }  = useNetwork();

	useEffect(() => {
		refetch();
	}, [])

	
	const handleCreate = () => {
		if (loggedIn) {
			if (supportedChainIds.includes(activeChain?.id!)) {
				route.push('/create'); 
			} else {
				addToast({
					title: "Chain not supported",
					body: "Discourses only supports 'Polygon' chain. Please use correct chain",
					type: ToastTypes.error,
					id: uuid(),
					duration: 6000
				})
			}
		} else { 
			setOpenConnectWallet((prev: boolean) => !prev);
		}
	}
	
	return (
		<div className="w-full h-screen overflow-x-clip">
			<Head>
				<title>Discourses by AGORA SQUARE</title>
				<meta name="description" content="Generated by create next app" />
				<link rel="icon" href="/discourse_logo_fav.svg" />
			</Head>
			<Layout >
				{/* <div className='w-32 h-32 bg-gradient rounded-full blur-3xl fixed top-24 right-[25vw] z-0' /> */}
				<BDecoration />
				<div className='w-full min-h-screen flex flex-col py-10 px-4 sm:px-0 gap-4 z-10'>
					{/* TopSection */}
					<TopBar showLogo={true} />
					{/* Body */}
					{ !showAll &&
						<HeroCard />
					}
					{/* explore */}
					{/* {dData && dData.getDiscoursesByChainID.length != 0 && <nav className='flex items-center justify-between py-4 px-2'>
						<div className='flex flex-col gap-1'>
							<h3 className='text-white font-semibold'>Explore</h3>
							<p className='text-white/40 font-medium text-xs hidden sm:flex'>Listen in to the most interesting discourses on web3</p>
						</div>
						{
							<button onClick={() => setShowAll(prev => !prev)} className='text-blue-500 w-max text-xs font-medium mt-4' >{showAll ? 'Show less' : 'Show all'}</button>}
					</nav>} */}
					{/* list */}
					<div className='relative w-full grid grid-cols-1 sm:grid-cols-2 md2:grid-cols-3 grid-flow-row items-center px-4 sm:px-10 md2:px-0 gap-2'>
						{
							dData && dData.getDiscoursesByChainID.length > 0 &&
							[].concat(dData.getDiscoursesByChainID).sort(
								(a: any, b: any) => +b.initTS - +a.initTS
							)
							// .slice(0, showAll ? dData.getDiscoursesByChainID.length : dData.getDiscoursesByChainID.length > 4 ? 4 : dData.getDiscoursesByChainID.length)
							.map((data: any) => (
								<DiscourseLongList state={0} key={data.id} data={data} />
							))
						}
						{
							dData && dData.getDiscoursesByChainID.length == 0 &&
							<div className='absolute inset-0 top-10 w-full py-4 flex items-center justify-center mt-10'>
								<img className='w-36' src="/404_discourses.png" alt="" />
							</div>
						}
						{
							dLoading &&
							<div className='w-full absolute inset-0 top-10 py-4 flex items-center justify-center'>
								<LoadingSpinner strokeColor='#ffffff' />
							</div>
						}
						{
							dError &&
							<div className='absolute inset-0 top-10 w-full py-4 flex items-center justify-center'>
								<p className='text-white/30 text-sm'>Error gettting Discourses</p>
							</div>
						}
					</div>
				</div>
			</Layout>
		</div>
	)
}

export default Home
