/**
 * IPFS upload utility for proposal attachments.
 * Uses Web3.Storage or a compatible IPFS pinning service.
 * Falls back to mock storage for development.
 */

const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';

export interface IPFSUploadResult {
  cid: string;
  url: string;
  name: string;
  size: number;
  type: string;
}

export async function uploadToIPFS(file: File): Promise<IPFSUploadResult> {
  // In production, replace with actual IPFS upload:
  // const client = new Web3Storage({ token: process.env.WEB3_STORAGE_TOKEN });
  // const cid = await client.put([file]);
  
  // Dev fallback: create object URL with mock CID
  const mockCid = `bafy${Math.random().toString(36).substring(2, 10)}`;
  
  return {
    cid: mockCid,
    url: `${IPFS_GATEWAY}${mockCid}`,
    name: file.name,
    size: file.size,
    type: file.type,
  };
}

export async function uploadMultipleToIPFS(files: File[]): Promise<IPFSUploadResult[]> {
  return Promise.all(files.map(uploadToIPFS));
}