import {
  ConnectButton,
  useConnectWallet,
  useWallets,
  useAutoConnectWallet,
} from "@mysten/dapp-kit";

export default function ConnectSUIButton() {
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();
  const autoConnectionStatus = useAutoConnectWallet();

  return (
    <div style={{ padding: 20 }}>
      <ConnectButton style={{ backgroundColor: "black", color: "white" }} />
      {/* <ul>
        {wallets.map((wallet) => (
          <li key={wallet.name}>
            <button
              onClick={() => {
                connect(
                  { wallet },
                  {
                    onSuccess: () => console.log("connected"),
                  },
                );
              }}
            >
              Connect to {wallet.name}
            </button>
          </li>
        ))}
      </ul> */}
    </div>
  );
}
