'use client'

import { WalletButton } from "../solana/solana-provider"

export default function Dashboard() {
  return (
    <div>
      <div className="max-w-xl mx-auto py-6 sm:px-6 lg:px-8 text-center">
        <div className="space-y-2">
          <p>Here are some helpful links to get you started.</p>
          <WalletButton />
        </div>
      </div>
    </div>
  )
}
