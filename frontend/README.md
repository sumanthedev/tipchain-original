# TipChain - XION Blockchain Tipping Platform

TipChain is a decentralized social tipping platform built on the XION blockchain. It allows creators to receive tips from fans directly, without intermediaries and with gasless transactions thanks to XION's account abstraction features.

## Features

- **Account Abstraction**: Sign in with Google, social accounts, email, or passkeys
- **Gasless Transactions**: Users don't pay for gas fees
- **Creator Profiles**: Custom profiles with bio, username, profile picture, and banner images
- **Tipping System**: Send tips to creators with optional messages
- **Shareable Links**: Each creator gets a unique tipping page link
- **Discovery Section**: Find and explore other creators on the platform
- **Responsive Design**: Works on desktop and mobile devices

## Smart Contract Integration

TipChain interacts with a custom XION smart contract that handles:

- Profile registration and management
- Recording tips between users
- User statistics tracking
- Username verification and availability

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Authentication**: Abstraxion by Burnt Labs
- **Blockchain**: XION (Cosmos Ecosystem)
- **Image Storage**: Cloudinary
- **Account Abstraction**: Abstraxion SDK

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- XION Testnet or Mainnet Treasury Contract (for gasless transactions)
- TipChain Smart Contract deployed on XION

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/tipchain.git
cd tipchain
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env.local` file in the root directory with the following content:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_here
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=f22
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=tipchain
NEXT_PUBLIC_CLOUDINARY_API_KEY=535635416935874
```

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Deploying to Production

1. Build the project
```bash
npm run build
```

2. Deploy to your hosting provider of choice (Vercel, Netlify, etc.)

## Smart Contract Setup

### Contract Preparation

1. Deploy the TipChain smart contract on XION
2. Create a Treasury contract for gasless transactions
3. Update your `.env.local` file with the deployed contract address

### Contract Commands

For detailed instructions on interacting with the contract using CLI, see the [Shell Script Commands](COMMANDS.md) documentation.

## Account Abstraction Setup

This project uses Abstraxion for account abstraction. Key features:

- Social login (Google, Twitter)
- Browser wallets (Keplr, Metamask, OKX)
- Email login
- Passkeys
- Gasless transactions via fee grants

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Abstraxion](https://docs.burnt.com/xion/developers/featured-guides/your-first-dapp/build-react-dapp-with-account-abstraxion) by Burnt Labs
- Powered by XION Blockchain

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
