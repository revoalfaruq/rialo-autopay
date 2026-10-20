import {
  createRialoClient,
  getDefaultRialoClientConfig,
  PublicKey,
  KELVIN_PER_RLO
} from "@rialo/ts-cdk";

const address = "8FtABd5g231VZbTPebtvzK5qTXRmrNr4ap4d2vUUyyA4";
const signature =
  "59eehei1UrYSgNnnmgVMPjHB9SJACCDySnXhmzeKVx6TsFcYomQizJwp3sjcQi9zaQ2KHMu8tztdpye9YWu5iTGL";

const client = createRialoClient(
  getDefaultRialoClientConfig("devnet")
);
const pubkey = PublicKey.fromString(address);

console.log("Network: Rialo DevNet");
console.log("Address:", address);

try {
  const balance = await client.getBalance(pubkey);
  console.log("Balance (kelvin):", balance.toString());
  console.log(
    "Balance (RLO):",
    (Number(balance) / KELVIN_PER_RLO).toString()
  );
} catch (e) {
  console.error("Balance check failed:", e.message);
}

try {
  const tx = await client.getTransaction(signature);
  console.log("Transaction lookup:");
  console.dir(tx, { depth: 6 });
} catch (e) {
  console.error("Transaction lookup failed:", e.message);
}
