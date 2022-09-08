export const fetchImage = async (twitterHandle: string) => {
    const r =  await fetch(`${process.env.NEXT_PUBLIC_CLIENT_URL}/api/twitter-user`,{
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        cache: 'force-cache',
        body: JSON.stringify({
            twitterHandle: twitterHandle
        })
    }).then(res => res.json());

    return r;
}