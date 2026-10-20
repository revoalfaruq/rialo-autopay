import {
  createConfig,
  getDefaultRialoClientConfig,
  connect,
  disconnect,
  getWallets,
  WalletRegistry,
  WalletEventBridge,
  initializeConfig,
  signAndSendTransaction
} from "@rialo/frost-core";

import {
  PublicKey,
  TransactionBuilder,
  transferInstruction,
  KELVIN_PER_RLO,
  createRialoClient
} from "@rialo/ts-cdk";

const statusEl = document.querySelector("#status");
const accountEl = document.querySelector("#account");
const connectBtn = document.querySelector("#connect");
const disconnectBtn = document.querySelector("#disconnect");
const sendBtn = document.querySelector("#send");
const recipientEl = document.querySelector("#recipient");
const amountEl = document.querySelector("#amount");
const signatureEl = document.querySelector("#signature");

let connectedAddress = null;

const defaultClientConfig = getDefaultRialoClientConfig("devnet");

const clientConfig = {
  ...defaultClientConfig,
  chain: {
    ...defaultClientConfig.chain,
    rpcUrl: import.meta.env.DEV
      ? defaultClientConfig.chain.rpcUrl
      : `${window.location.origin}/api/rialo-rpc`
  }
};

const client = createRialoClient(clientConfig);

const config = createConfig({
  clientConfig,
  autoConnect: false,
  storage: null
});

const registry = new WalletRegistry(config);
const bridge = new WalletEventBridge(config);
initializeConfig(config, registry, bridge);

function showStatus(message) {
  statusEl.textContent = message;
}

function updateControls() {
  disconnectBtn.disabled = !connectedAddress;
  sendBtn.disabled = !connectedAddress;
}

function toKelvins(rawAmount) {
  const value = rawAmount.trim();
  const factor = BigInt(KELVIN_PER_RLO);
  const factorText = factor.toString();

  if (!/^10*$/.test(factorText)) {
    throw new Error("Unsupported KELVIN_PER_RLO format.");
  }

  const decimals = factorText.length - 1;

  if (!/^\d+(\.\d+)?$/.test(value)) {
    throw new Error("Enter a valid RLO amount.");
  }

  const [whole, fraction = ""] = value.split(".");

  if (fraction.length > decimals) {
    throw new Error(`Use no more than ${decimals} decimal places.`);
  }

  const fractionalValue = fraction.padEnd(decimals, "0");
  const amount =
    BigInt(whole) * factor +
    BigInt(fractionalValue || "0");

  if (amount <= 0n) {
    throw new Error("Transfer amount must be greater than zero.");
  }

  return amount;
}

connectBtn.addEventListener("click", async () => {
  connectBtn.disabled = true;
  showStatus("Looking for a Rialo wallet...");

  try {
    await registry.ready;

    const wallets = await getWallets(config);

    if (wallets.length === 0) {
      showStatus(
        "No wallet found. Enable the Rialo wallet extension and reload the page."
      );
      return;
    }

    const preferred = wallets.find(
      wallet => wallet.name.toLowerCase() === "rialo"
    );
    const selected = preferred ?? wallets[0];

    showStatus(`Requesting connection to ${selected.name}...`);

    const result = await connect(config, {
      walletName: selected.name
    });

    connectedAddress = result.accountAddress;
    accountEl.textContent = connectedAddress;
    showStatus(`Wallet connected: ${result.walletName}`);
    updateControls();
  } catch (error) {
    showStatus(`Connection failed: ${error.message}`);
  } finally {
    connectBtn.disabled = false;
  }
});

disconnectBtn.addEventListener("click", async () => {
  disconnectBtn.disabled = true;

  try {
    await disconnect(config);
    connectedAddress = null;
    accountEl.textContent = "Not connected";
    signatureEl.textContent = "—";
    showStatus("Wallet disconnected.");
    updateControls();
  } catch (error) {
    showStatus(`Disconnect failed: ${error.message}`);
    updateControls();
  }
});

sendBtn.addEventListener("click", async () => {
  if (!connectedAddress) {
    showStatus("Connect your wallet first.");
    return;
  }

  let recipient;
  let amount;

  try {
    recipient = PublicKey.fromString(recipientEl.value.trim());
    amount = toKelvins(amountEl.value);
  } catch (error) {
    showStatus(`Invalid input: ${error.message}`);
    return;
  }

  if (recipientEl.value.trim() === connectedAddress) {
    showStatus("The recipient address matches the sender address.");
    return;
  }

  const confirmed = window.confirm(
    `CONFIRM DEVNET TRANSFER\n\n` +
    `From: ${connectedAddress}\n` +
    `To: ${recipientEl.value.trim()}\n` +
    `Amount: ${amountEl.value} RLO\n\n` +
    `This transaction will request your wallet signature. Continue?`
  );

  if (!confirmed) {
    showStatus("Transfer cancelled before signing.");
    return;
  }

  sendBtn.disabled = true;
  signatureEl.textContent = "—";
  showStatus("Building DevNet transaction...");

  try {
    const payer = PublicKey.fromString(connectedAddress);
    const configHashPrefix = await client.getConfigHashPrefix();

    const transaction = TransactionBuilder.create()
      .setPayer(payer)
      .setValidFrom(BigInt(Date.now()))
      .setConfigHashPrefix(configHashPrefix)
      .addInstruction(
        transferInstruction(payer, recipient, amount)
      )
      .build();

    showStatus("Requesting wallet signature and submitting transaction...");

    const result = await signAndSendTransaction(config, {
      transaction
    });

    signatureEl.textContent = result.signature;
    showStatus(
      "The SDK returned a transaction signature. Verify its status on DevNet before treating the transfer as successful."
    );
  } catch (error) {
    showStatus(`Transfer failed or is not yet confirmed: ${error.message}`);
  } finally {
    updateControls();
  }
});

updateControls();

// AutoPay UI preview only.
// This does not create a schedule or send any transaction.
const dailyPreviewBtn = document.querySelector("#daily-preview");
const dailyRecipientEl = document.querySelector("#daily-recipient");
const dailyAmountEl = document.querySelector("#daily-amount");
const dailyTimeEl = document.querySelector("#daily-time");
const dailyPreviewResult = document.querySelector("#daily-preview-result");

dailyPreviewBtn?.addEventListener("click", () => {
  const recipient = dailyRecipientEl.value.trim();
  const amount = dailyAmountEl.value.trim();
  const time = dailyTimeEl.value;

  dailyPreviewResult.hidden = false;

  if (!recipient || !amount || !time) {
    dailyPreviewResult.textContent =
      "Please enter the recipient address, RLO amount, and sending time.";
    return;
  }

  if (!/^\d+(\.\d+)?$/.test(amount) || Number(amount) <= 0) {
    dailyPreviewResult.textContent =
      "Invalid RLO amount. Enter a number greater than zero.";
    return;
  }

  const summary = document.createElement("div");
  const heading = document.createElement("strong");
  heading.textContent = "Daily Schedule Preview";

  const recipientLine = document.createElement("p");
  recipientLine.textContent = `Recipient: ${recipient}`;

  const amountLine = document.createElement("p");
  amountLine.textContent = `Amount: ${amount} RLO per day`;

  const timeLine = document.createElement("p");
  timeLine.textContent = `Time: ${time} (${document.querySelector("#daily-timezone").value})`;

  const statusLine = document.createElement("p");
  statusLine.className = "warning-note";
  statusLine.textContent =
    "Status: Preview only — the schedule is inactive and no transaction was sent.";

  summary.append(heading, recipientLine, amountLine, timeLine, statusLine);
  dailyPreviewResult.replaceChildren(summary);
});
