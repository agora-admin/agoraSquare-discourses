import Head from "next/head";
import Layout from "../components/layout/Layout";
import Branding from "../components/utils/Branding";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { signIn, useSession, } from 'next-auth/react';
import { FooterIcon, TwitterIcon } from "../components/utils/SvgHub";
import { useLazyQuery, useMutation } from "@apollo/client";
import { CHECK_HANDLE, GET_USERDATA } from "../lib/queries";
import { LINK_TWITTER } from "../lib/mutations";;
import { shortAddress } from "../helper/StringHelper";
import WalletOptionsLink from "../components/dialogs/WalletOptionsLink";
import AppContext from "../components/utils/AppContext";
import { usePersistedTokenStore } from "../userToken";

const InvitePage = () => {
    const route = useRouter();
    const { loggedIn, walletAddress } = useContext(AppContext);
    const [handle, setHandle] = useState('');
    const [duplicateHandle, setDuplicateHandle] = useState(false);
    const [alreadyLinked, setAlreadyLinked] = useState(false);
    const [accountLinked, setAccountLinked] = useState(false);
    const token = usePersistedTokenStore(state => state.token);
    const [checkTwitterLink, { data: tData, loading: tLoading, error: tError }] = useLazyQuery(CHECK_HANDLE, {
        fetchPolicy: 'network-only',
        context: { 
            headers: {
                'Authorization': 'Bearer ' + token,
            } 
        },
    })
    const [ linkTwitter, { data: linkData, loading: linkLoading, error: linkError }] = useMutation(LINK_TWITTER, {
        fetchPolicy: 'network-only',
        context: { 
            headers: {
                'Authorization': 'Bearer ' + token,
            } 
        },
    })
    const [getUserData, { data: uData }] = useLazyQuery(GET_USERDATA, {
        context: { 
            headers: {
                'Authorization': 'Bearer ' + token,
            } 
        },
    });

    const { data: session } = useSession();

    useEffect(() => {
        if (loggedIn) {
            getUserData()
        }
    }, [getUserData, loggedIn])

    useEffect(() => {
        if (uData && uData.getUserData.twitterConnected) {
            setAlreadyLinked(true);
            setHandle(uData.getUserData.twitter.twitter_handle);
        }
    }, [uData])


    useEffect(() => {
        if (session && (session as any).user.username !== "") {
            
            setHandle((session as any).user.username);
            checkTwitterLink({
                variables: {
                    handle: (session as any).user.username
                }
            })
        }
    }, [checkTwitterLink, session])

    useEffect(() => {
        if (tData) {
            if (tData.checkTwitterLink.connected) {
                if (!accountLinked && tData.checkTwitterLink.address !== walletAddress) {
                    setDuplicateHandle(true);
                }
            } else {
                linkTwitter({
                    variables: {
                        twitterHandle: handle,
                        twitterName: (session as any).user.name,
                        imageUrl: (session as any).user.image
                    },
                    onCompleted: () => {
                        setAccountLinked(true);
                        getUserData();
                        route.push("/");
                    }
                })
            }
        }
    }, [accountLinked, getUserData, handle, linkTwitter, route, session, tData, walletAddress])


    return (
        <div className="w-full h-screen ">
            <Head>
                <title>DIscourses | AGORA SQUARE</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/discourse_logo_fav.svg" />
            </Head>

            <Layout >
                <div className='w-full min-h-screen flex flex-col py-10 gap-4 z-10'>
                    {/* TopSection */}

                    <div className="w-full flex items-center justify-center">
                        <Branding />
                    </div>

                    {/* Body */}
                    <div className="flex flex-col gap-4 mt-10 grow mx-2 md:mx-10 lg:mx-20">
                        {/* left section */}
                        <div className="relative bg-card w-full flex flex-col p-8 rounded-2xl">
                            <h3 className="text-white/70 text-xl font-semibold">Link Accounts</h3>
                            {<p className="text-[#c6c6c6] text-xs sm:w-[50%] my-4">Link you wallet address and twitter account for a better experience with Discourses</p>}

                            {walletAddress === "" && <WalletOptionsLink /> }
                            {loggedIn && <div className='cursor-default py-2 flex items-center w-max gap-2 text-[#616162] text-sm font-semibold'>
                                <div className='flex items-center overflow-clip bg-gradient w-6 h-6 rounded-xl' >
                                    <img className="w-6 h-6 object-cover rounded-xl object-center" src={`https://avatar.tobi.sh/${walletAddress}`} alt="" />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className='text-white text-xs'>{shortAddress(walletAddress === "" ? '' : walletAddress)}</p>
                                </div>
                            </div>}
                            {!alreadyLinked && duplicateHandle &&<button onClick={() => signIn()} className="button-o px-4 py-2 w-max flex items-center gap-4 justify-center my-2">
                                <TwitterIcon />
                                <p className="text-[12px] text-[#1DA1F2] font-semibold">Connect Twitter</p>
                            </button>}
                            {!alreadyLinked && !duplicateHandle && !session?.user &&<button onClick={() => signIn()} className="button-o px-4 py-2 w-max flex items-center gap-4 justify-center my-2">
                                <TwitterIcon />
                                <p className="text-[12px] text-[#1DA1F2] font-semibold">Connect Twitter</p>
                            </button>}
                            {
                                alreadyLinked && uData.getUserData.twitterConnected && <p className="text-xs text-[#1DA1F2] font-semibold flex items-center gap-2"><TwitterIcon /> @{uData.getUserData.twitter.twitter_handle}</p>
                            }

                            {handle !== "" && duplicateHandle && !alreadyLinked && <p className="text-xs font-medium tracking-wide text-red-300"><span className="text-[#1DA1F2]">@{handle}</span> already associated with another wallet.</p>}
                            {handle !== "" && alreadyLinked && <p className="text-xs font-medium tracking-wide text-[#6a6a6a] mt-4">Accounts already linked!</p>}
                            {handle !== "" && accountLinked && <p className="text-xs font-medium tracking-wide text-[#6a6a6a] mt-4">Accounts linked!</p>}

                            <img className="absolute right-2 bottom-0 hidden sm:flex" src="/link_bg.svg" alt="" />
                        </div>
                    </div>

                    <footer className="flex justify-center items-center gap-2 xs:gap-4">
                        <div className="hidden xs:block">
                            <FooterIcon />
                        </div>
                        <div className=" h-full w-[2px] bg-[#212427]" />

                        <a className="text-xs text-[#797979] hover:text-[#c6c6c6] t-all" href="#">Terms & conditions</a>
                        <a className="text-xs text-[#797979] hover:text-[#c6c6c6] t-all" href="#">Privacy policy</a>
                        <a className="text-xs text-[#797979] hover:text-[#c6c6c6] t-all" href="#">Whitepaper</a>
                        <a className="text-xs text-[#797979] hover:text-[#c6c6c6] t-all" href="#">Discord</a>
                    </footer>
                </div>

            </Layout>

        </div>
    );
}

export default InvitePage;