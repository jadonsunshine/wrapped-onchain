// src/app/api/upload/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const metadata = {
      name: body.name || "WrappedOnChain Persona",
      description: body.description || "2025 On-chain Year in Review",
      external_url: "https://wrappedonchain.xyz",
      attributes: body.attributes || [],
      image: body.image || "ipfs://QmYourDefaultImageHash",
    };

    // FIX 1: Use .public.json()
    const upload = await pinata.upload.public.json(metadata);

    // FIX 2: The new SDK returns 'cid', not 'IpfsHash'
    const ipfsUri = `ipfs://${upload.cid}`;

    return NextResponse.json({ 
        success: true, 
        ipfsUri: ipfsUri 
    }, { status: 200 });

  } catch (e) {
    console.error("Pinata Upload Error:", e);
    return NextResponse.json(
      { error: "Internal Server Error during IPFS upload" },
      { status: 500 }
    );
  }
}