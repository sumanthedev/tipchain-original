import { Coin } from "@cosmjs/stargate";

/**
 * Converts XION to uxion (micro XION - the blockchain's base unit)
 * 1 XION = 1,000,000 uxion
 */
export const toMicroXion = (xion: string): string => {
  const amount = parseFloat(xion);
  if (isNaN(amount)) {
    throw new Error("Invalid XION amount");
  }
  const microXion = Math.floor(amount * 1_000_000).toString();
  return microXion;
};

/**
 * Converts uxion (micro XION) to XION
 * 1,000,000 uxion = 1 XION
 */
export const fromMicroXion = (uxion: string): string => {
  const amount = parseInt(uxion);
  if (isNaN(amount)) {
    throw new Error("Invalid uxion amount");
  }
  return (amount / 1_000_000).toString();
};

/**
 * Sends XION tokens from one address to another
 * 
 * @param client - The signing client from useAbstraxionSigningClient
 * @param senderAddress - The sender's address
 * @param recipientAddress - The recipient's address
 * @param amount - The amount in XION (not micro XION)
 * @returns The transaction result
 */
export const sendXionTokens = async (
  client: any,
  senderAddress: string,
  recipientAddress: string,
  amount: string
) => {
  if (!client || !senderAddress || !recipientAddress || !amount) {
    throw new Error("Missing required parameters");
  }
  
  try {
    // Convert XION to uxion (micro XION)
    const microAmount = toMicroXion(amount);
    
    // Create the coin object
    const coin: Coin = {
      denom: "uxion",
      amount: microAmount
    };
    
    // Send the tokens
    const result = await client.sendTokens(
      senderAddress,
      recipientAddress,
      [coin],
      "auto",
      "TipChain transfer"
    );
    
    return result;
  } catch (error) {
    console.error("Token transfer error:", error);
    throw error;
  }
};

/**
 * Gets the balance of XION tokens for an address
 * 
 * @param queryClient - The query client from useAbstraxionClient
 * @param address - The address to check
 * @returns The balance in XION (not micro XION)
 */
export const getXionBalance = async (
  queryClient: any,
  address: string
): Promise<string> => {
  if (!queryClient || !address) {
    throw new Error("Missing required parameters");
  }
  
  try {
    const balanceResponse = await queryClient.getBalance(address, "uxion");
    
    // Convert from micro XION to XION for display
    return fromMicroXion(balanceResponse.amount);
  } catch (error) {
    console.error("Error getting balance:", error);
    throw error;
  }
}; 