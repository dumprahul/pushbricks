// src/lib/pinata.ts
import { PinataSDK } from "pinata-web3";

// Initialize Pinata SDK
const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT!,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
});

// Interface matching your property metadata
export interface PropertyMetadata {
  name: string;
  address: string;
  description: string;
  propertyType: string;
  squareFeet: string;
  yearBuilt: string;
  image: string; // Will store IPFS CID of the image
}

/**
 * Upload base64 image to IPFS via Pinata
 * @param base64Image - Base64 encoded image string
 * @param fileName - Name for the file
 * @returns IPFS CID (Content Identifier)
 */
export async function uploadBase64ImageToPinata(
  base64Image: string,
  fileName: string
): Promise<string> {
  try {
    // Convert base64 to Blob
    const base64Data = base64Image.split(',')[1]; // Remove data:image/...;base64, prefix
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    
    // Create File from Blob
    const file = new File([blob], fileName, { type: 'image/jpeg' });
    
    // Upload to Pinata
    const upload = await pinata.upload.file(file);
    
    console.log("Image uploaded to IPFS:", upload.IpfsHash);
    return upload.IpfsHash; // Returns the CID
  } catch (error) {
    console.error("Error uploading image to Pinata:", error);
    throw new Error(`Failed to upload image: ${(error as Error).message}`);
  }
}

/**
 * Upload property metadata JSON to IPFS via Pinata
 * @param metadata - Property metadata object
 * @returns IPFS CID (Content Identifier)
 */
export async function uploadMetadataToPinata(
  metadata: PropertyMetadata
): Promise<string> {
  try {
    // Upload JSON metadata
    const upload = await pinata.upload.json(metadata);
    
    console.log("Metadata uploaded to IPFS:", upload.IpfsHash);
    return upload.IpfsHash; // Returns the CID
  } catch (error) {
    console.error("Error uploading metadata to Pinata:", error);
    throw new Error(`Failed to upload metadata: ${(error as Error).message}`);
  }
}

/**
 * Fetch metadata from IPFS using CID
 * @param cid - IPFS Content Identifier
 * @returns Property metadata object
 */
export async function fetchMetadataFromIPFS(
  cid: string
): Promise<PropertyMetadata> {
  try {
    const gatewayUrl = process.env.NEXT_PUBLIC_PINATA_GATEWAY;
    const response = await fetch(`${gatewayUrl}${cid}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    
    const metadata = await response.json();
    console.log("Metadata fetched from IPFS:", metadata);
    return metadata;
  } catch (error) {
    console.error("Error fetching metadata from IPFS:", error);
    throw new Error(`Failed to fetch metadata: ${(error as Error).message}`);
  }
}

/**
 * Get full IPFS URL for an image CID
 * @param cid - IPFS Content Identifier
 * @returns Full gateway URL
 */
export function getIPFSImageUrl(cid: string): string {
  const gatewayUrl = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs/";
  return `${gatewayUrl}${cid}`;
}

/**
 * Upload complete property (image + metadata) to IPFS
 * @param imageData - Base64 encoded image
 * @param metadata - Property metadata (without image)
 * @returns Object containing image CID and metadata CID
 */
export async function uploadCompletePropertyToIPFS(
  imageData: string,
  metadata: Omit<PropertyMetadata, 'image'>
): Promise<{ imageCID: string; metadataCID: string; metadataURI: string }> {
  try {
    // Step 1: Upload image
    console.log("Uploading image to IPFS...");
    const imageCID = await uploadBase64ImageToPinata(
      imageData,
      `${metadata.name.replace(/\s+/g, '-')}.jpg`
    );
    
    // Step 2: Create complete metadata with image CID
    const completeMetadata: PropertyMetadata = {
      ...metadata,
      image: imageCID,
    };
    
    // Step 3: Upload metadata
    console.log("Uploading metadata to IPFS...");
    const metadataCID = await uploadMetadataToPinata(completeMetadata);
    
    // Step 4: Create metadata URI (for smart contracts)
    const metadataURI = `ipfs://${metadataCID}`;
    
    console.log("Complete upload successful!");
    console.log("Image CID:", imageCID);
    console.log("Metadata CID:", metadataCID);
    console.log("Metadata URI:", metadataURI);
    
    return {
      imageCID,
      metadataCID,
      metadataURI,
    };
  } catch (error) {
    console.error("Error uploading property to IPFS:", error);
    throw error;
  }
}

