import {
  createRialoClient,
  getDefaultRialoClientConfig,
  PublicKey,
  KELVIN_PER_RLO
} from "@rialo/ts-cdk";

const recipient = PublicKey.fromString(
  "8FtABd5g231VZbTPebtvzK5qTXRmrNr4ap4d2vUUyyA4"
);

const client = createRialoClient(
  getDefaultRialoClientConfig("devnet")
);

console.log("Network: Rialo DevNet");
console.log("Recipient: 8FtABd5g231VZbTPebtvzK5qTXRmrNr4ap4d2vUUyyA4");
console.log("Requesting: 1 RLO");

try {
  const result = await client.requestAirdropAndConfirm(
    recipient,
    BigInt(KELVIN_PER_RLO)
  );

  console.log("Faucet response:");
  console.dir(result, { depth: 5 });
} catch (error) {
  console.error("Faucet request failed:", error.message);
  process.exitCode = 1;
}
